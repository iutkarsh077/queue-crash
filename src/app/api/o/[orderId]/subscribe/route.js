import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { expireStaleOrder } from "@/lib/expire-orders";
import { isOpenStatus } from "@/lib/order-lifecycle";
import { isValidPublicOrderId } from "@/lib/order-id";
import { limitOrReject } from "@/lib/rate-limit";
import { readPushSubscriptionBody } from "@/lib/subscription";
import { assertVapidConfig } from "@/lib/vapid";
import Order, { ORDER_STATUS } from "@/models/Order";
import PushSubscription from "@/models/PushSubscription";

export async function POST(request, { params }) {
  try {
    assertVapidConfig();
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  const limited = limitOrReject(request, {
    name: "order-subscribe",
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) {
    return limited;
  }

  const { orderId } = await params;
  if (!isValidPublicOrderId(orderId)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid subscription data." },
      { status: 400 },
    );
  }

  const parsed = readPushSubscriptionBody(body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await connectDb();
    const found = await Order.findOne({ publicId: orderId })
      .select("status createdAt")
      .lean();

    if (!found) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = await expireStaleOrder(found);
    if (order.status === ORDER_STATUS.EXPIRED) {
      return NextResponse.json({ error: "This order has expired." }, { status: 410 });
    }
    if (order.status === ORDER_STATUS.PICKED_UP) {
      return NextResponse.json(
        { error: "This order was picked up." },
        { status: 410 },
      );
    }
    if (!isOpenStatus(order.status)) {
      return NextResponse.json({ error: "This order is closed." }, { status: 409 });
    }

    await PushSubscription.findOneAndUpdate(
      { orderId: order._id, endpoint: parsed.endpoint },
      {
        orderId: order._id,
        endpoint: parsed.endpoint,
        p256dh: parsed.p256dh,
        auth: parsed.auth,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { error: "Subscription failed. Try again." },
      { status: 500 },
    );
  }
}

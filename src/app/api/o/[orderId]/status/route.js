import { connection, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { expireStaleOrder } from "@/lib/expire-orders";
import { publicOrderView } from "@/lib/order-lifecycle";
import { isValidPublicOrderId } from "@/lib/order-id";
import { limitOrReject } from "@/lib/rate-limit";
import Order from "@/models/Order";

export async function GET(request, { params }) {
  await connection();
  const limited = limitOrReject(request, {
    name: "order-status",
    limit: 40,
    windowMs: 60 * 1000,
  });
  if (limited) {
    return limited;
  }

  const { orderId } = await params;
  if (!isValidPublicOrderId(orderId)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    await connectDb();
    const found = await Order.findOne({ publicId: orderId })
      .select("tokenNumber status label createdAt")
      .lean();

    if (!found) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = await expireStaleOrder(found);
    return NextResponse.json(publicOrderView(order), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Status check failed. Try again." },
      { status: 500 },
    );
  }
}

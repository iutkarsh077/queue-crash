import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { connectDb } from "@/lib/db";
import { createPublicOrderId } from "@/lib/order-id";
import { createOrderQrDataUrl } from "@/lib/qr";
import { allocateDailyToken } from "@/lib/tokens";
import Order, { ORDER_MAX_AGE_MS, ORDER_STATUS } from "@/models/Order";

const LABEL_MAX_LENGTH = 40;

function cleanLabel(value) {
  if (value == null || value === "") {
    return "";
  }
  if (typeof value !== "string") {
    return null;
  }
  const label = value.replace(/\s+/g, " ").trim();
  if (label.length > LABEL_MAX_LENGTH) {
    return null;
  }
  return label;
}

export async function POST(request) {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "You must log in." }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const label = cleanLabel(body.label);
  if (label === null) {
    return NextResponse.json(
      { error: "Use a short label, up to 40 characters." },
      { status: 400 },
    );
  }

  if (body.tokenNumber != null || body.status != null || body.orderId != null) {
    return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
  }

  try {
    await connectDb();

    const now = new Date();
    let order = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { tokenNumber, tokenDate } = await allocateDailyToken(owner.id);
      try {
        order = await Order.create({
          publicId: createPublicOrderId(),
          ownerId: owner.id,
          tokenNumber,
          tokenDate,
          status: ORDER_STATUS.PREPARING,
          label,
          readyAt: null,
          createdAt: now,
          expiresAt: new Date(now.getTime() + ORDER_MAX_AGE_MS),
        });
        break;
      } catch (error) {
        if (error?.code !== 11000 || attempt === 2) {
          throw error;
        }
      }
    }

    if (!order) {
      throw new Error("Order was not saved.");
    }

    const origin = getPublicAppOrigin(request.headers);
    const orderUrl = `${origin}/o/${order.publicId}`;
    let qrDataUrl = null;
    try {
      qrDataUrl = await createOrderQrDataUrl(orderUrl);
    } catch {
      return NextResponse.json({
        id: String(order._id),
        tokenNumber: order.tokenNumber,
        status: order.status,
        label: order.label,
        orderUrl,
        qrDataUrl: null,
        createdAt: order.createdAt,
        error: "QR code failed. Try again.",
      });
    }

    return NextResponse.json({
      id: String(order._id),
      tokenNumber: order.tokenNumber,
      status: order.status,
      label: order.label,
      orderUrl,
      qrDataUrl,
      createdAt: order.createdAt,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "Token conflict. Try again." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Order creation failed. Try again." },
      { status: 500 },
    );
  }
}

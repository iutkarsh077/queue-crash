import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { deleteOrderSubscriptions, sendReadyPush } from "@/lib/push";
import { canMarkPickedUp, canMarkReady } from "@/lib/order-lifecycle";
import { isValidMongoId } from "@/lib/mongo-id";
import Order, { ORDER_STATUS } from "@/models/Order";

export async function PATCH(request, { params }) {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "You must log in." }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidMongoId(id)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const nextStatus = body.status;
  if (
    nextStatus !== ORDER_STATUS.READY &&
    nextStatus !== ORDER_STATUS.PICKED_UP
  ) {
    return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
  }

  if (body.tokenNumber != null || body.orderId != null || body.publicId != null) {
    return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
  }

  try {
    await connectDb();
    const current = await Order.findOne({ _id: id, ownerId: owner.id }).lean();
    if (!current) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (nextStatus === ORDER_STATUS.READY) {
      return markReady(current);
    }
    return markPickedUp(current);
  } catch {
    return NextResponse.json(
      { error: "Order update failed. Try again." },
      { status: 500 },
    );
  }
}

async function markReady(current) {
  if (current.status === ORDER_STATUS.READY) {
    return NextResponse.json({
      status: current.status,
      tokenNumber: current.tokenNumber,
      alreadyReady: true,
      push: { sent: 0, removed: 0, failed: 0, lastStatusCode: null },
    });
  }

  if (!canMarkReady(current.status)) {
    return NextResponse.json(
      { error: "This order cannot be marked Ready." },
      { status: 409 },
    );
  }

  const readyAt = new Date();
  const updated = await Order.findOneAndUpdate(
    { _id: current._id, status: ORDER_STATUS.PREPARING },
    { $set: { status: ORDER_STATUS.READY, readyAt } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    const latest = await Order.findById(current._id).lean();
    if (latest?.status === ORDER_STATUS.READY) {
      return NextResponse.json({
        status: latest.status,
        tokenNumber: latest.tokenNumber,
        alreadyReady: true,
        push: { sent: 0, removed: 0, failed: 0, lastStatusCode: null },
      });
    }
    return NextResponse.json(
      { error: "This order cannot be marked Ready." },
      { status: 409 },
    );
  }

  let push = { sent: 0, removed: 0, failed: 0, lastStatusCode: null };
  try {
    push = await sendReadyPush(updated);
  } catch (error) {
    console.info(
      JSON.stringify({
        event: "push-ready-error",
        publicId: updated.publicId,
        message: error?.message || "Push delivery failed.",
      }),
    );
  }

  return NextResponse.json({
    status: updated.status,
    tokenNumber: updated.tokenNumber,
    alreadyReady: false,
    push,
  });
}

async function markPickedUp(current) {
  if (current.status === ORDER_STATUS.PICKED_UP) {
    await deleteOrderSubscriptions(current._id);
    return NextResponse.json({
      status: current.status,
      tokenNumber: current.tokenNumber,
    });
  }

  if (!canMarkPickedUp(current.status)) {
    return NextResponse.json(
      { error: "This order cannot be marked Picked up." },
      { status: 409 },
    );
  }

  const updated = await Order.findOneAndUpdate(
    { _id: current._id, status: { $in: [ORDER_STATUS.PREPARING, ORDER_STATUS.READY] } },
    { $set: { status: ORDER_STATUS.PICKED_UP } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { error: "This order cannot be marked Picked up." },
      { status: 409 },
    );
  }

  await deleteOrderSubscriptions(updated._id);
  return NextResponse.json({
    status: updated.status,
    tokenNumber: updated.tokenNumber,
  });
}

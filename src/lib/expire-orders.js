import Order, { ORDER_STATUS } from "@/models/Order";
import PushSubscription from "@/models/PushSubscription";
import { OPEN_STATUSES, isPastExpiry } from "@/lib/order-lifecycle";

export async function expireStaleOrder(order, now = new Date()) {
  if (!order || !OPEN_STATUSES.includes(order.status)) {
    return order;
  }
  if (!isPastExpiry(order.createdAt, now)) {
    return order;
  }

  await Order.updateOne(
    { _id: order._id, status: { $in: OPEN_STATUSES } },
    { $set: { status: ORDER_STATUS.EXPIRED } },
  );
  await PushSubscription.deleteMany({ orderId: order._id });
  return { ...order, status: ORDER_STATUS.EXPIRED };
}

export async function expireOpenOrders(now = new Date()) {
  const orders = await Order.find({
    status: { $in: OPEN_STATUSES },
  })
    .select("_id createdAt status")
    .lean();

  const staleIds = orders
    .filter((row) => isPastExpiry(row.createdAt, now))
    .map((row) => row._id);

  if (staleIds.length === 0) {
    return { expired: 0, subscriptionsDeleted: 0 };
  }

  const updated = await Order.updateMany(
    { _id: { $in: staleIds }, status: { $in: OPEN_STATUSES } },
    { $set: { status: ORDER_STATUS.EXPIRED } },
  );
  const removed = await PushSubscription.deleteMany({
    orderId: { $in: staleIds },
  });

  return {
    expired: updated.modifiedCount ?? 0,
    subscriptionsDeleted: removed.deletedCount ?? 0,
  };
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OrderLiveCard } from "@/components/order-live-card";
import { GuestShell } from "@/components/guest-shell";
import { connectDb } from "@/lib/db";
import { expireStaleOrder } from "@/lib/expire-orders";
import { isValidPublicOrderId } from "@/lib/order-id";
import { publicOrderView } from "@/lib/order-lifecycle";
import Order from "@/models/Order";

export const metadata = {
  title: "Order",
};

export const instant = false;

export default function CustomerOrderPage({ params }) {
  return (
    <Suspense
      fallback={
        <GuestShell title="Queue">
          <p className="text-base leading-6 text-ink-soft">Loading.</p>
        </GuestShell>
      }
    >
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }) {
  const { orderId } = await params;
  if (!isValidPublicOrderId(orderId)) {
    notFound();
  }

  await connectDb();
  const found = await Order.findOne({ publicId: orderId })
    .select("tokenNumber status label createdAt")
    .lean();

  if (!found) {
    notFound();
  }

  const order = await expireStaleOrder(found);

  return (
    <GuestShell title="Queue">
      <main>
        <OrderLiveCard
          orderId={orderId}
          initial={publicOrderView(order)}
          vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""}
        />
      </main>
    </GuestShell>
  );
}

import { Suspense } from "react";
import { navigation } from "next/cache";
import { GuestShell, PrimaryLink, SecondaryLink } from "@/components/guest-shell";
import { OwnerWorkspace } from "@/components/owner-workspace";
import { getSessionUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { utcDateKey } from "@/lib/tokens";
import Order from "@/models/Order";

export const metadata = {
  title: "Dashboard",
};

export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <GuestShell title="Queue">
          <p className="text-base leading-6 text-ink-soft">Loading.</p>
        </GuestShell>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await navigation();
  const user = await getSessionUser();

  if (!user) {
    return (
      <GuestShell
        title="Queue"
        footer={<PrimaryLink href="/login">Log in with Google</PrimaryLink>}
      >
        <main>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Dashboard
          </h1>
          <p className="mt-3 text-base leading-6 text-ink-soft">
            You are not logged in.
          </p>
        </main>
      </GuestShell>
    );
  }

  await connectDb();
  const todayOrders = await Order.find({
    ownerId: user.id,
    tokenDate: utcDateKey(),
  })
    .sort({ tokenNumber: -1 })
    .limit(20)
    .select("tokenNumber status label")
    .lean();

  const list = todayOrders.map((item) => ({
    id: String(item._id),
    tokenNumber: item.tokenNumber,
    status: item.status,
    label: item.label || "",
  }));

  return (
    <GuestShell
      title="Queue"
      footer={<SecondaryLink href="/api/auth/logout">Log out</SecondaryLink>}
    >
      <main>
        <p className="text-base leading-6 text-ink-soft">Hello, {user.name}.</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
          Create an order
        </h1>
        <p className="mt-3 text-base leading-6 text-ink-soft">
          Add an optional label. We will make a token and a QR code.
        </p>
        <OwnerWorkspace initialOrders={list} />
      </main>
    </GuestShell>
  );
}

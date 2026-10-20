import { GuestShell, PrimaryLink } from "@/components/guest-shell";

export default function OrderNotFound() {
  return (
    <GuestShell title="Queue">
      <main>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Order not found
        </h1>
        <p className="mt-3 text-base leading-6 text-ink-soft">
          This order is not valid, or it has expired.
        </p>
        <div className="mt-6">
          <PrimaryLink href="/">Open home</PrimaryLink>
        </div>
      </main>
    </GuestShell>
  );
}

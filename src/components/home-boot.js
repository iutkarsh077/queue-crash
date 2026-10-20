"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { GuestShell, SecondaryLink } from "@/components/guest-shell";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { readLastOrderId } from "@/lib/last-order";

function subscribeLastOrder() {
  return () => {};
}

export function HomeBoot() {
  const router = useRouter();
  const lastOrderId = useSyncExternalStore(
    subscribeLastOrder,
    readLastOrderId,
    () => "",
  );

  useEffect(() => {
    if (lastOrderId) {
      router.replace(`/o/${lastOrderId}`);
    }
  }, [lastOrderId, router]);

  if (lastOrderId) {
    return (
      <GuestShell title="Queue">
        <ServiceWorkerRegister />
        <p className="text-base leading-6 text-ink-soft">Opening your order.</p>
      </GuestShell>
    );
  }

  return (
    <GuestShell
      title="Queue"
      footer={<SecondaryLink href="/login">Log in</SecondaryLink>}
    >
      <ServiceWorkerRegister />
      <main>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Scan the QR code
        </h1>
        <p className="mt-3 text-base leading-6 text-ink-soft">
          Open the QR code from the restaurant. We will show your order and wait
          time.
        </p>
        <p className="mt-6 text-base leading-6 text-ink">
          After you open your order, this app will return to that order the next
          time you open it.
        </p>
      </main>
    </GuestShell>
  );
}

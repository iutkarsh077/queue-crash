"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/guest-shell";
import { patchOrderStatus } from "@/lib/owner-order-api";
import { ORDER_STATUS } from "@/lib/order-status-copy";

export function OwnerOrderList({ orders, onStatus }) {
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function updateStatus(id, status) {
    setError("");
    setBusyId(id);
    try {
      const data = await patchOrderStatus(id, status);
      onStatus?.(id, data.status);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusyId("");
    }
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">Today</h2>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-[20px] border border-ink bg-paper px-4 py-3 text-base leading-6 text-ink"
        >
          {error}
        </p>
      ) : null}
      <ul className="mt-4 flex flex-col gap-3">
        {orders.map((item) => (
          <li
            key={item.id}
            className="rounded-[20px] border border-ink bg-paper px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-semibold tabular-nums text-ink">
                {item.tokenNumber}
                {item.label ? (
                  <span className="ml-2 text-base font-normal text-ink-soft">
                    {item.label}
                  </span>
                ) : null}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink">
                {item.status}
              </span>
            </div>
            {item.status === ORDER_STATUS.PREPARING ? (
              <div className="mt-3">
                <PrimaryButton
                  disabled={busyId === item.id}
                  onClick={() => updateStatus(item.id, ORDER_STATUS.READY)}
                >
                  {busyId === item.id ? "Saving." : "Ready"}
                </PrimaryButton>
              </div>
            ) : null}
            {item.status === ORDER_STATUS.READY ? (
              <div className="mt-3">
                <SecondaryButton
                  disabled={busyId === item.id}
                  onClick={() => updateStatus(item.id, ORDER_STATUS.PICKED_UP)}
                >
                  {busyId === item.id ? "Saving." : "Picked up"}
                </SecondaryButton>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

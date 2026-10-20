"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/guest-shell";
import { patchOrderStatus } from "@/lib/owner-order-api";
import { ORDER_STATUS } from "@/lib/order-status-copy";

export function CreateOrderPanel({ order, onCreated, onStatus }) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyBusy, setReadyBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Order creation failed. Try again.");
        return;
      }
      setLabel("");
      onCreated?.(data);
      if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Order creation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status) {
    if (!order?.id) {
      setError("Order update failed. Try again.");
      return;
    }
    setReadyBusy(true);
    setError("");
    try {
      const data = await patchOrderStatus(order.id, status);
      onStatus?.(order.id, data.status);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setReadyBusy(false);
    }
  }

  function downloadPng() {
    if (!order?.qrDataUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = order.qrDataUrl;
    link.download = `order-token-${order.tokenNumber}.png`;
    link.click();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-base text-ink">
          Label
          <input
            name="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={40}
            placeholder="Table 4"
            className="h-12 rounded-[14px] border border-ink bg-paper px-4 text-base text-ink placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          />
        </label>
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Creating order." : "Create order"}
        </PrimaryButton>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-[20px] border border-ink bg-paper px-4 py-3 text-base leading-6 text-ink"
        >
          {error}
        </p>
      ) : null}

      {order ? (
        <section
          aria-live="polite"
          className="mt-6 rounded-[20px] border border-ink bg-paper p-6"
        >
          <p className="text-base text-ink-soft">Token</p>
          <p className="mt-2 font-semibold tracking-tight text-ink tabular-nums text-7xl md:text-8xl">
            {order.tokenNumber}
          </p>
          {order.label ? (
            <p className="mt-2 text-lg leading-6 text-ink">{order.label}</p>
          ) : null}
          <p className="mt-2 text-base leading-6 text-ink-soft">{order.status}</p>
          {order.qrDataUrl ? (
            // Data URLs are not remote files. next/image does not fit here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.qrDataUrl}
              alt={`QR code for token ${order.tokenNumber}`}
              width={320}
              height={320}
              className="mt-6 h-auto w-full max-w-[320px] border border-ink bg-white"
            />
          ) : null}
          <p className="mt-4 break-all text-base leading-6 text-ink-soft">
            {order.orderUrl}
          </p>
          {order.status === ORDER_STATUS.PREPARING ? (
            <div className="mt-6">
              <PrimaryButton
                disabled={readyBusy || !order.id}
                onClick={() => updateStatus(ORDER_STATUS.READY)}
              >
                {readyBusy ? "Saving." : "Ready"}
              </PrimaryButton>
            </div>
          ) : null}
          {order.status === ORDER_STATUS.READY ? (
            <div className="mt-6">
              <SecondaryButton
                disabled={readyBusy || !order.id}
                onClick={() => updateStatus(ORDER_STATUS.PICKED_UP)}
              >
                {readyBusy ? "Saving." : "Picked up"}
              </SecondaryButton>
            </div>
          ) : null}
          <div className="mt-3">
            <SecondaryButton onClick={downloadPng} disabled={!order.qrDataUrl}>
              Download QR code
            </SecondaryButton>
          </div>
        </section>
      ) : null}
    </div>
  );
}

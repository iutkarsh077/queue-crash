"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PrimaryButton } from "@/components/guest-shell";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { syncLastOrderId } from "@/lib/last-order";
import { ORDER_STATUS } from "@/lib/order-status-copy";
import { savePushSubscription } from "@/lib/push-subscribe";
import {
  isIosDevice,
  isStandaloneDisplay,
  playReadyAlert,
  supportsWebPush,
} from "@/lib/push-client";

const FALLBACK_TEXT = "Keep this page open - it will show Ready and beep";
const IPHONE_TEXT =
  "On iPhone, add this site to your Home Screen. Then open the app and tap Notify me.";
const NOTIFY_OK_TEXT =
  "We will notify you when your food is ready. Keep phone alerts on.";

const SERVER_PUSH_ENV = {
  pushReady: false,
  iosNeedsHomeScreen: false,
  permissionDenied: false,
};

let clientPushEnv = SERVER_PUSH_ENV;

function readClientPushEnv() {
  if (clientPushEnv !== SERVER_PUSH_ENV) {
    return clientPushEnv;
  }
  const ios = isIosDevice();
  const standalone = isStandaloneDisplay();
  clientPushEnv = {
    pushReady: supportsWebPush() && (!ios || standalone),
    iosNeedsHomeScreen: ios && !standalone,
    permissionDenied:
      typeof Notification !== "undefined" && Notification.permission === "denied",
  };
  return clientPushEnv;
}

function subscribePushEnv() {
  return () => {};
}

export function OrderLiveCard({ orderId, initial, vapidPublicKey }) {
  const [order, setOrder] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const alertedReady = useRef(initial.status === ORDER_STATUS.READY);
  const pushEnv = useSyncExternalStore(
    subscribePushEnv,
    readClientPushEnv,
    () => SERVER_PUSH_ENV,
  );
  const pushReady = pushEnv.pushReady;
  const iosNeedsHomeScreen = pushEnv.iosNeedsHomeScreen;

  useEffect(() => {
    syncLastOrderId(orderId, order.status);
  }, [orderId, order.status]);

  useEffect(() => {
    if (!pushReady || iosNeedsHomeScreen || !vapidPublicKey) {
      return undefined;
    }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return undefined;
    }
    if (!order.open || order.status !== ORDER_STATUS.PREPARING) {
      return undefined;
    }

    let cancelled = false;
    savePushSubscription(orderId, vapidPublicKey)
      .then(() => {
        if (!cancelled) {
          setNotifySaved(true);
          setMessage(NOTIFY_OK_TEXT);
        }
      })
      .catch(() => {
        // Guest can tap Notify me.
      });
    return () => {
      cancelled = true;
    };
  }, [iosNeedsHomeScreen, order.open, order.status, orderId, pushReady, vapidPublicKey]);

  useEffect(() => {
    if (!order.open) {
      return undefined;
    }

    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/o/${orderId}/status`, {
          cache: "no-store",
        });
        if (response.status === 404) {
          setOrder((current) => ({ ...current, status: "Missing", open: false }));
          clearInterval(timer);
          return;
        }
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setOrder(data);
        if (data.status === ORDER_STATUS.READY && !alertedReady.current) {
          alertedReady.current = true;
          playReadyAlert();
        }
        if (!data.open) {
          clearInterval(timer);
        }
      } catch {
        // Keep the last known status.
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [order.open, orderId]);

  const isReady = order.status === ORDER_STATUS.READY;
  const isClosed =
    order.status === ORDER_STATUS.PICKED_UP ||
    order.status === ORDER_STATUS.EXPIRED ||
    order.status === "Missing";

  async function onNotify() {
    setError("");
    setMessage("");

    if (iosNeedsHomeScreen) {
      setMessage(IPHONE_TEXT);
      return;
    }
    if (!supportsWebPush() || !pushReady) {
      setMessage(FALLBACK_TEXT);
      return;
    }
    if (!vapidPublicKey) {
      setError("Notification settings are missing.");
      return;
    }

    setSaving(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPermissionDenied(true);
        setMessage(FALLBACK_TEXT);
        return;
      }

      await savePushSubscription(orderId, vapidPublicKey);
      setNotifySaved(true);
      setMessage(NOTIFY_OK_TEXT);
    } catch (subscribeError) {
      setError(subscribeError.message || "Subscription failed. Try again.");
      setNotifySaved(false);
    } finally {
      setSaving(false);
    }
  }

  const denied = permissionDenied || pushEnv.permissionDenied;
  const showNotify =
    order.open &&
    order.status === ORDER_STATUS.PREPARING &&
    pushReady &&
    !notifySaved &&
    !denied &&
    !iosNeedsHomeScreen;

  const showFallback =
    order.open &&
    order.status === ORDER_STATUS.PREPARING &&
    (denied || !pushReady || iosNeedsHomeScreen);

  return (
    <div>
      <ServiceWorkerRegister />
      {order.label ? (
        <p className="text-base leading-6 text-ink-soft">{order.label}</p>
      ) : null}
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
        Your order
      </h1>

      <section
        aria-live="polite"
        className={`mt-6 rounded-[20px] border border-ink p-6 ${
          isReady ? "bg-green-wash" : "bg-paper"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isReady ? "bg-green text-white" : "bg-white text-ink"
            }`}
          >
            {statusChip(order.status)}
          </span>
          <span className="text-base text-ink-soft">
            Position {order.tokenNumber}
          </span>
        </div>
        <p className="mt-6 font-semibold tracking-tight text-ink tabular-nums text-7xl md:text-8xl">
          {order.tokenNumber}
        </p>
        <p className="mt-3 text-lg leading-6 text-ink">{statusText(order.status)}</p>
        {order.status === ORDER_STATUS.PREPARING ? (
          <p className="mt-4 text-base leading-6 text-ink-soft">
            We will tell you when it is your turn.
          </p>
        ) : null}
      </section>

      {iosNeedsHomeScreen && order.status === ORDER_STATUS.PREPARING ? (
        <p className="mt-4 text-base leading-6 text-ink">{IPHONE_TEXT}</p>
      ) : null}

      {showFallback ? (
        <p className="mt-4 text-base leading-6 text-ink">{FALLBACK_TEXT}</p>
      ) : null}

      {message ? (
        <p className="mt-4 text-base leading-6 text-ink" role="status">
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-[20px] border border-ink bg-paper px-4 py-3 text-base leading-6 text-ink"
        >
          {error}
        </p>
      ) : null}

      {isClosed && order.status === "Missing" ? (
        <p className="mt-4 text-base leading-6 text-ink">Order not found.</p>
      ) : null}

      {showNotify ? (
        <div className="sticky bottom-0 mt-6 bg-white pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <PrimaryButton onClick={onNotify} disabled={saving}>
            {saving ? "Saving." : "Notify me"}
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}

function statusChip(status) {
  if (status === ORDER_STATUS.READY) {
    return "Ready";
  }
  if (status === ORDER_STATUS.PICKED_UP) {
    return "Picked up";
  }
  if (status === ORDER_STATUS.EXPIRED) {
    return "Expired";
  }
  return "Waiting";
}

function statusText(status) {
  if (status === ORDER_STATUS.READY) {
    return "Your food is ready.";
  }
  if (status === ORDER_STATUS.PICKED_UP) {
    return "This order was picked up.";
  }
  if (status === ORDER_STATUS.EXPIRED) {
    return "This order has expired.";
  }
  if (status === "Missing") {
    return "Order not found.";
  }
  return "Preparing";
}

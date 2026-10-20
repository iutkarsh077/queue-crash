import { registerBackgroundAlerts } from "@/lib/background-alerts";
import {
  showNotifyTestNotification,
  urlBase64ToUint8Array,
} from "@/lib/push-client";

export async function savePushSubscription(
  orderId,
  vapidPublicKey,
  { testNotification = false } = {},
) {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  const json = subscription.toJSON();
  const response = await fetch(`/api/o/${orderId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.saved) {
    throw new Error(data.error || "Subscription failed. Try again.");
  }
  await registerBackgroundAlerts();
  if (testNotification) {
    try {
      await showNotifyTestNotification(orderId);
    } catch {
      // The OS channel may be muted. Copy on the page explains this.
    }
  }
  return true;
}

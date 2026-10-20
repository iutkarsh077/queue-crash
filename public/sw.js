importScripts("/queue-store.js");

const READY_VIBRATE = [300, 120, 300, 120, 300, 120, 600];

function isSafeUrl(url) {
  return typeof url === "string" && /^\/o\/[A-Za-z0-9_-]{32}$/.test(url);
}

function readVibrate(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return READY_VIBRATE;
  }
  const pattern = value.filter(
    (item) => Number.isFinite(item) && item >= 0 && item <= 10000,
  );
  return pattern.length > 0 ? pattern.slice(0, 99) : READY_VIBRATE;
}

async function showReadyNotification({ title, body, url, tag, vibrate }) {
  const noteTag = tag || "food-ready";
  try {
    const existing = await self.registration.getNotifications();
    for (const note of existing) {
      if (
        note.tag === noteTag ||
        note.tag === "food-ready" ||
        note.tag === "notify-test"
      ) {
        note.close();
      }
    }
  } catch {
    // getNotifications is optional.
  }

  return self.registration.showNotification(title || "Queue", {
    body: body || "Your food is ready.",
    data: { url: isSafeUrl(url) ? url : "/" },
    tag: noteTag,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: readVibrate(vibrate),
    silent: false,
    renotify: true,
    requireInteraction: true,
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  event.waitUntil(
    showReadyNotification({
      title: typeof data.title === "string" ? data.title : "Queue",
      body: typeof data.body === "string" ? data.body : "Your food is ready.",
      url: data.url,
      tag: typeof data.tag === "string" ? data.tag : "food-ready",
      vibrate: data.vibrate,
    }),
  );
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "order-ready") {
    event.waitUntil(checkStoredOrderReady());
  }
});

async function checkStoredOrderReady() {
  const orderId = await queueStoreGet("lastOrderId");
  if (typeof orderId !== "string" || !/^[A-Za-z0-9_-]{32}$/.test(orderId)) {
    return;
  }

  const response = await fetch(`/api/o/${orderId}/status`, { cache: "no-store" });
  if (!response.ok) {
    return;
  }
  const order = await response.json();
  if (order.status !== "Ready") {
    return;
  }

  const already = await queueStoreGet("alertedReadyId");
  if (already === orderId) {
    return;
  }

  await showReadyNotification({
    title: "Queue",
    body: `Your food is ready - token ${order.tokenNumber}`,
    url: `/o/${orderId}`,
    tag: `order-${orderId}`,
  });
  await queueStoreSet("alertedReadyId", orderId);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = isSafeUrl(event.notification.data?.url)
    ? event.notification.data.url
    : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clients) => {
        for (const client of clients) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.pathname === url && "focus" in client) {
              return client.focus();
            }
          } catch {
            // Ignore a bad client URL.
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
        return undefined;
      },
    ),
  );
});

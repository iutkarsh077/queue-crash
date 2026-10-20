importScripts("/queue-store.js");

const SW_VERSION = "ready-sound-4";

function isSafeUrl(url) {
  return typeof url === "string" && /^\/o\/[A-Za-z0-9_-]{32}$/.test(url);
}

function showReadyNotification({ title, body, url, tag }) {
  const baseTag = typeof tag === "string" && tag ? tag : "food-ready";
  return self.registration.showNotification(title || "Queue", {
    body: body || "Your food is ready.",
    data: { url: isSafeUrl(url) ? url : "/", version: SW_VERSION },
    tag: `${baseTag}-${Date.now()}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
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

async function askOpenPagesToPlayReadySound() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) {
    client.postMessage({ type: "play-ready-sound" });
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  event.waitUntil(
    Promise.all([
      askOpenPagesToPlayReadySound(),
      showReadyNotification({
        title: typeof data.title === "string" ? data.title : "Queue",
        body: typeof data.body === "string" ? data.body : "Your food is ready.",
        url: data.url,
        tag: typeof data.tag === "string" ? data.tag : "food-ready",
      }),
    ]),
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

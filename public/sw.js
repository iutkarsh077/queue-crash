function isSafeUrl(url) {
  return typeof url === "string" && /^\/o\/[A-Za-z0-9_-]{32}$/.test(url);
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = typeof data.title === "string" ? data.title : "Queue";
  const body =
    typeof data.body === "string" ? data.body : "Your food is ready.";
  const url = isSafeUrl(data.url) ? data.url : "/";
  const tag = typeof data.tag === "string" ? data.tag : "food-ready";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
      tag,
      vibrate: Array.isArray(data.vibrate) ? data.vibrate : [200, 100, 200],
      requireInteraction: data.requireInteraction !== false,
    }),
  );
});

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

export const SERVICE_WORKER_URL = "/sw.js?v=ready-sound-4";

export function registerQueueServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  return navigator.serviceWorker
    .register(SERVICE_WORKER_URL, { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      registration.update().catch(() => {});
      return registration;
    })
    .catch(() => null);
}

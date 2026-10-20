export async function registerBackgroundAlerts() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    if (navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Persist is optional.
  }

  const registration = await navigator.serviceWorker.ready;
  if (!("periodicSync" in registration)) {
    return;
  }

  try {
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    if (status.state === "denied") {
      return;
    }
  } catch {
    // Some browsers do not expose this permission name.
  }

  try {
    await registration.periodicSync.register("order-ready", {
      minInterval: 15 * 60 * 1000,
    });
  } catch {
    // Chrome grants this only for an installed PWA with engagement.
  }
}

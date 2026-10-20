import {
  foodReadyNotificationOptions,
  READY_VIBRATE_PATTERN,
  shouldPlayReadyWebAudio,
} from "./order-lifecycle.js";

export { READY_VIBRATE_PATTERN };

export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

export function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || "";
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || iPadOs;
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function supportsWebPush() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

let vibrateArmed = false;
let pendingReadyVibrate = false;

function tryVibrate(pattern = READY_VIBRATE_PATTERN) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }
  try {
    return Boolean(navigator.vibrate(pattern));
  } catch {
    return false;
  }
}

export function armVibrateOnUserTap() {
  if (typeof window === "undefined" || vibrateArmed) {
    return;
  }
  vibrateArmed = true;
  window.addEventListener(
    "pointerdown",
    () => {
      if (pendingReadyVibrate) {
        pendingReadyVibrate = false;
        tryVibrate();
      }
    },
    { capture: true },
  );
}

export function playReadyVibrate() {
  const ok = tryVibrate();
  if (!ok) {
    pendingReadyVibrate = true;
  }
  return ok;
}

export function playReadyAlert() {
  playReadyVibrate();

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  } catch {
    // Sound is optional.
  }
}

export async function showPageNotification({
  title,
  body,
  url,
  tag,
  requireInteraction = true,
}) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return false;
  }
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  try {
    const existing = await registration.getNotifications();
    for (const note of existing) {
      if (!tag || note.tag === tag || note.tag === "food-ready") {
        note.close();
      }
    }
  } catch {
    // getNotifications is optional.
  }
  await registration.showNotification(
    title || "Queue",
    foodReadyNotificationOptions({ body, url, tag, requireInteraction }),
  );
  return true;
}

export async function notifyFoodReady({ tokenNumber, orderId, documentVisible }) {
  let shown = false;
  try {
    shown = await showPageNotification({
      title: "Queue",
      body: `Your food is ready - token ${tokenNumber}`,
      url: `/o/${orderId}`,
      tag: `order-${orderId}`,
    });
  } catch {
    shown = false;
  }

  if (shouldPlayReadyWebAudio(documentVisible, shown)) {
    playReadyAlert();
  }
  return shown;
}

export async function showNotifyTestNotification(orderId) {
  return showPageNotification({
    title: "Queue",
    body: "Alerts are on. This uses sound and vibrate.",
    url: `/o/${orderId}`,
    tag: "notify-test",
    requireInteraction: false,
  });
}

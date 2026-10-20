export const READY_VIBRATE_PATTERN = [400, 150, 400, 150, 600];

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

import { ORDER_MAX_AGE_MS, ORDER_STATUS } from "./order-status-copy.js";

export const OPEN_STATUSES = [ORDER_STATUS.PREPARING, ORDER_STATUS.READY];

export function isOpenStatus(status) {
  return status === ORDER_STATUS.PREPARING || status === ORDER_STATUS.READY;
}

export function canMarkReady(status) {
  return status === ORDER_STATUS.PREPARING;
}

export function canMarkPickedUp(status) {
  return isOpenStatus(status);
}

export function isPastExpiry(createdAt, now = new Date(), maxAgeMs = ORDER_MAX_AGE_MS) {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return false;
  }
  return now.getTime() - created.getTime() > maxAgeMs;
}

export function foodReadyText(tokenNumber) {
  return `Your food is ready - token ${tokenNumber}`;
}

export const READY_VIBRATE_PATTERN = [400, 150, 400, 150, 600];

export function foodReadyNotificationOptions({
  body,
  url,
  tag,
  requireInteraction = true,
}) {
  return {
    body,
    data: { url },
    tag,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    silent: false,
    renotify: true,
    requireInteraction,
  };
}

export function foodReadyPayload(tokenNumber, publicId) {
  return {
    title: "Queue",
    body: foodReadyText(tokenNumber),
    url: `/o/${publicId}`,
    tag: `order-${publicId}`,
    requireInteraction: true,
    vibrate: READY_VIBRATE_PATTERN,
    silent: false,
    renotify: true,
  };
}

export function isSafeNotificationUrl(url) {
  return typeof url === "string" && /^\/o\/[A-Za-z0-9_-]{32}$/.test(url);
}

export function shouldSendReadyPush(previousStatus) {
  return previousStatus === ORDER_STATUS.PREPARING;
}

export function shouldAlertReadyTransition(previousStatus, nextStatus, alreadyAlerted) {
  if (alreadyAlerted) {
    return false;
  }
  return (
    previousStatus === ORDER_STATUS.PREPARING && nextStatus === ORDER_STATUS.READY
  );
}

export function shouldPlayReadyWebAudio(documentVisible, systemNotificationShown) {
  return Boolean(documentVisible) && !systemNotificationShown;
}

export const READY_PUSH_TTL_SECONDS = Math.floor(ORDER_MAX_AGE_MS / 1000);

export const READY_PUSH_OPTIONS = {
  urgency: "high",
  TTL: READY_PUSH_TTL_SECONDS,
};

export function publicOrderView(order) {
  return {
    tokenNumber: order.tokenNumber,
    status: order.status,
    label: order.label || "",
    open: isOpenStatus(order.status),
  };
}

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

export function foodReadyPayload(tokenNumber, publicId) {
  return {
    title: "Queue",
    body: foodReadyText(tokenNumber),
    url: `/o/${publicId}`,
    tag: `order-${publicId}`,
    requireInteraction: true,
    vibrate: [400, 150, 400, 150, 600],
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

export function publicOrderView(order) {
  return {
    tokenNumber: order.tokenNumber,
    status: order.status,
    label: order.label || "",
    open: isOpenStatus(order.status),
  };
}

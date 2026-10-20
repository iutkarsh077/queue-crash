import { isOpenStatus } from "./order-lifecycle.js";

export const LAST_ORDER_KEY = "queue.lastOrderId";
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{32}$/;

function isValidPublicOrderId(value) {
  return typeof value === "string" && PUBLIC_ID_PATTERN.test(value);
}

export function readLastOrderId() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const value = window.localStorage.getItem(LAST_ORDER_KEY) || "";
    return isValidPublicOrderId(value) ? value : "";
  } catch {
    return "";
  }
}

export function saveLastOrderId(orderId) {
  if (typeof window === "undefined" || !isValidPublicOrderId(orderId)) {
    return;
  }
  try {
    window.localStorage.setItem(LAST_ORDER_KEY, orderId);
  } catch {
    // Storage can be blocked.
  }
}

export function clearLastOrderId(orderId) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const current = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!orderId || current === orderId) {
      window.localStorage.removeItem(LAST_ORDER_KEY);
    }
  } catch {
    // Storage can be blocked.
  }
}

export function syncLastOrderId(orderId, status) {
  if (!isValidPublicOrderId(orderId)) {
    return;
  }
  if (status === "Missing" || !isOpenStatus(status)) {
    clearLastOrderId(orderId);
    return;
  }
  saveLastOrderId(orderId);
}

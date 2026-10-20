import crypto from "crypto";

export const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{32}$/;

export function createPublicOrderId() {
  return crypto.randomBytes(24).toString("base64url");
}

export function isValidPublicOrderId(value) {
  return typeof value === "string" && PUBLIC_ID_PATTERN.test(value);
}

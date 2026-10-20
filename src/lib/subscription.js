const KEY_PATTERN = /^[A-Za-z0-9_-]+={0,2}$/;

function isHttpsEndpoint(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") {
      return true;
    }
    return url.protocol === "http:" && url.hostname === "localhost";
  } catch {
    return false;
  }
}

export function readPushSubscriptionBody(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid subscription data." };
  }

  if (body.orderId != null || body.tokenNumber != null || body.status != null) {
    return { error: "Invalid subscription data." };
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  const p256dh =
    typeof body.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth.trim() : "";

  if (!isHttpsEndpoint(endpoint) || endpoint.length > 2048) {
    return { error: "Invalid subscription data." };
  }
  if (!KEY_PATTERN.test(p256dh) || p256dh.length < 20 || p256dh.length > 256) {
    return { error: "Invalid subscription data." };
  }
  if (!KEY_PATTERN.test(auth) || auth.length < 8 || auth.length > 256) {
    return { error: "Invalid subscription data." };
  }

  return { endpoint, p256dh, auth };
}

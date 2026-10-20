import crypto from "crypto";

export const SESSION_COOKIE = "session";
export const STATE_COOKIE = "oauth_state";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is missing.");
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function cookieOptions({ maxAge } = {}) {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function createSessionValue(userId) {
  const payload = Buffer.from(JSON.stringify({ userId }), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(token) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const given = Buffer.from(signature);
  const check = Buffer.from(expected);
  if (given.length !== check.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(given, check)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.userId) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(cookieStore) {
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return readSessionValue(token);
}

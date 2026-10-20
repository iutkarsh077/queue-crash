export function createRateLimiter(store = new Map()) {
  return function rateLimit({ key, limit, windowMs, now = Date.now() }) {
    let bucket = store.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      store.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      return { ok: false, retryAfterMs: bucket.resetAt - now };
    }
    return { ok: true, remaining: limit - bucket.count };
  };
}

const rateLimit = createRateLimiter();

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "local";
}

export function limitOrReject(request, { name, limit, windowMs }) {
  const key = `${name}:${clientIp(request)}`;
  const result = rateLimit({ key, limit, windowMs });
  if (result.ok) {
    return null;
  }
  return Response.json(
    { error: "Too many requests. Try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)) },
    },
  );
}

export { rateLimit };

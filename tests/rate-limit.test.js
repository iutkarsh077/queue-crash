import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimiter } from "../src/lib/rate-limit.js";

describe("rate limit", () => {
  it("allows requests under the limit and then rejects", () => {
    const rateLimit = createRateLimiter();
    const first = rateLimit({ key: "a", limit: 2, windowMs: 1000, now: 0 });
    const second = rateLimit({ key: "a", limit: 2, windowMs: 1000, now: 10 });
    const third = rateLimit({ key: "a", limit: 2, windowMs: 1000, now: 20 });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(third.ok, false);
  });
});

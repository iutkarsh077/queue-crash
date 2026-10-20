import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readPushSubscriptionBody } from "../src/lib/subscription.js";

describe("push subscription body", () => {
  const valid = {
    endpoint: "https://push.example/sub/1",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls6eG8cR",
      auth: "tBHItJI5svbpez7KI4CCXg",
    },
  };

  it("accepts a valid subscription", () => {
    const parsed = readPushSubscriptionBody(valid);
    assert.equal(parsed.endpoint, valid.endpoint);
    assert.equal(parsed.p256dh, valid.keys.p256dh);
  });

  it("rejects client status and token fields", () => {
    const parsed = readPushSubscriptionBody({
      ...valid,
      status: "Ready",
      tokenNumber: 9,
    });
    assert.equal(parsed.error, "Invalid subscription data.");
  });

  it("rejects a non-https endpoint", () => {
    const parsed = readPushSubscriptionBody({
      ...valid,
      endpoint: "http://evil.example/sub",
    });
    assert.equal(parsed.error, "Invalid subscription data.");
  });
});

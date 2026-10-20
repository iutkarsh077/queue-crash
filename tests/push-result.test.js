import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ownerReadyPushMessage,
  shouldDeleteSubscription,
} from "../src/lib/push-result.js";

describe("push result", () => {
  it("deletes only gone subscriptions", () => {
    assert.equal(shouldDeleteSubscription(404), true);
    assert.equal(shouldDeleteSubscription(410), true);
    assert.equal(shouldDeleteSubscription(500), false);
    assert.equal(shouldDeleteSubscription(201), false);
  });

  it("tells the owner if a closed-app alert was sent", () => {
    assert.match(ownerReadyPushMessage({ sent: 1 }), /Alert sent/);
    assert.match(ownerReadyPushMessage({ sent: 0, failed: 1 }), /failed/);
    assert.match(ownerReadyPushMessage({ sent: 0, removed: 1 }), /gone/);
    assert.match(ownerReadyPushMessage({ sent: 0, failed: 0, removed: 0 }), /Notify me/);
  });
});

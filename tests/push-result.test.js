import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldDeleteSubscription } from "../src/lib/push-result.js";

describe("push result", () => {
  it("deletes only gone subscriptions", () => {
    assert.equal(shouldDeleteSubscription(404), true);
    assert.equal(shouldDeleteSubscription(410), true);
    assert.equal(shouldDeleteSubscription(500), false);
    assert.equal(shouldDeleteSubscription(201), false);
  });
});

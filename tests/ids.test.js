import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidMongoId } from "../src/lib/mongo-id.js";
import { isValidPublicOrderId } from "../src/lib/order-id.js";

describe("ids", () => {
  it("accepts a 32-character public order id", () => {
    assert.equal(isValidPublicOrderId("A".repeat(32)), true);
    assert.equal(isValidPublicOrderId("short"), false);
  });

  it("accepts a 24-character mongo id", () => {
    assert.equal(isValidMongoId("64b1f0c3a1b2c3d4e5f60789"), true);
    assert.equal(isValidMongoId("not-an-id"), false);
  });
});

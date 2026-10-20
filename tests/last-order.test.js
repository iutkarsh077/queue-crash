import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  },
};

const { LAST_ORDER_KEY, clearLastOrderId, readLastOrderId, syncLastOrderId } =
  await import("../src/lib/last-order.js");

describe("last order storage", () => {
  beforeEach(() => {
    store.clear();
  });

  it("saves an open order id", () => {
    const id = "A".repeat(32);
    syncLastOrderId(id, "Preparing");
    assert.equal(readLastOrderId(), id);
    assert.equal(store.get(LAST_ORDER_KEY), id);
  });

  it("clears a picked up or missing order", () => {
    const id = "B".repeat(32);
    syncLastOrderId(id, "Preparing");
    syncLastOrderId(id, "Picked up");
    assert.equal(readLastOrderId(), "");
    syncLastOrderId(id, "Preparing");
    syncLastOrderId(id, "Missing");
    assert.equal(readLastOrderId(), "");
    clearLastOrderId(id);
    assert.equal(readLastOrderId(), "");
  });

  it("rejects a short id", () => {
    syncLastOrderId("short", "Preparing");
    assert.equal(readLastOrderId(), "");
  });
});

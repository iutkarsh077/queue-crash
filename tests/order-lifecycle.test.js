import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canMarkPickedUp,
  canMarkReady,
  foodReadyPayload,
  foodReadyText,
  isOpenStatus,
  isPastExpiry,
  isSafeNotificationUrl,
  publicOrderView,
  shouldSendReadyPush,
} from "../src/lib/order-lifecycle.js";

describe("order lifecycle", () => {
  it("allows Ready only from Preparing", () => {
    assert.equal(canMarkReady("Preparing"), true);
    assert.equal(canMarkReady("Ready"), false);
    assert.equal(canMarkReady("Picked up"), false);
  });

  it("allows Picked up from open orders only", () => {
    assert.equal(canMarkPickedUp("Preparing"), true);
    assert.equal(canMarkPickedUp("Ready"), true);
    assert.equal(canMarkPickedUp("Expired"), false);
  });

  it("detects expiry after three hours", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const almost = new Date("2026-01-01T02:59:59.000Z");
    const over = new Date("2026-01-01T03:00:01.000Z");
    assert.equal(isPastExpiry(createdAt, almost), false);
    assert.equal(isPastExpiry(createdAt, over), true);
  });

  it("builds food-ready text and a safe URL", () => {
    assert.equal(foodReadyText(12), "Your food is ready - token 12");
    const payload = foodReadyPayload(12, "a".repeat(32));
    assert.equal(payload.body, "Your food is ready - token 12");
    assert.equal(isSafeNotificationUrl(payload.url), true);
    assert.equal(isSafeNotificationUrl("/o/not-valid"), false);
    assert.equal(isSafeNotificationUrl("https://evil.example/o/aaaa"), false);
  });

  it("does not send a second Ready push", () => {
    assert.equal(shouldSendReadyPush("Preparing"), true);
    assert.equal(shouldSendReadyPush("Ready"), false);
    assert.equal(isOpenStatus("Ready"), true);
    assert.equal(isOpenStatus("Picked up"), false);
  });

  it("hides owner fields from the public view", () => {
    const view = publicOrderView({
      tokenNumber: 4,
      status: "Preparing",
      label: "Table 1",
      ownerId: "secret",
      publicId: "hidden",
    });
    assert.deepEqual(view, {
      tokenNumber: 4,
      status: "Preparing",
      label: "Table 1",
      open: true,
    });
  });
});

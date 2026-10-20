import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertVapidConfig, readVapidConfig } from "../src/lib/vapid.js";

describe("VAPID config", () => {
  it("lists missing settings", () => {
    const result = readVapidConfig({});
    assert.deepEqual(result.missing, [
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      "VAPID_PRIVATE_KEY",
      "VAPID_SUBJECT",
    ]);
  });

  it("fails clearly when settings are missing", () => {
    assert.throws(
      () => assertVapidConfig({}),
      /VAPID settings are missing: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT/,
    );
  });

  it("rejects a subject that is not mailto or https", () => {
    assert.throws(
      () =>
        assertVapidConfig({
          NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub",
          VAPID_PRIVATE_KEY: "priv",
          VAPID_SUBJECT: "queue@localhost",
        }),
      /VAPID_SUBJECT must start with mailto: or https:\/\//,
    );
  });

  it("accepts complete settings", () => {
    const config = assertVapidConfig({
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub",
      VAPID_PRIVATE_KEY: "priv",
      VAPID_SUBJECT: "mailto:queue@localhost",
    });
    assert.equal(config.publicKey, "pub");
  });
});

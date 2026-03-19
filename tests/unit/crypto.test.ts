import { describe, expect, it } from "vitest";

import { decryptJson, encryptJson } from "@/lib/security/crypto";

describe("message crypto", () => {
  it("roundtrips encrypted json", () => {
    const source = {
      role: "assistant",
      parts: [{ type: "text", text: "hello" }],
    };
    const encrypted = encryptJson(source);
    const decrypted = decryptJson<typeof source>(encrypted);

    expect(decrypted).toEqual(source);
  });
});

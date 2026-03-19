import { describe, expect, it } from "vitest";

import { getLanguageModel } from "@/lib/ai/provider";
import { createDemoState } from "@/lib/domain/seed";

describe("provider adapter", () => {
  it("returns null when the provider is not configured", () => {
    expect(getLanguageModel(createDemoState().models[0])).toBeNull();
  });
});

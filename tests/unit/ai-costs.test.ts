import { describe, expect, it } from "vitest";

import { checkBudgetAllowance, estimateTextCost } from "@/lib/ai/costs";
import { createDemoState } from "@/lib/domain/seed";

describe("ai costs", () => {
  const state = createDemoState();
  const model = state.models[0];
  const member = state.profiles.find((profile) => profile.role === "member")!;

  it("estimates input and output cost", () => {
    expect(
      estimateTextCost({
        model,
        inputTokens: 1000,
        outputTokens: 1000,
      }),
    ).toBe(0.002);
  });

  it("blocks when monthly budget is exhausted", () => {
    const result = checkBudgetAllowance({
      user: member,
      model,
      summary: {
        totalCostUsd: member.budget.monthlyUsdLimit,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalRequests: 0,
        daily: [],
        byModel: [],
      },
    });

    expect(result.blocked).toBe(true);
  });
});

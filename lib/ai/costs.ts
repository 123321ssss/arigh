import type { ModelConfig, SessionUser, UsageSummary } from "@/lib/domain/types";

export function estimateTextCost(params: {
  model: ModelConfig;
  inputTokens: number;
  outputTokens: number;
}) {
  const inputCost = (params.inputTokens / 1000) * params.model.inputCostPer1k;
  const outputCost = (params.outputTokens / 1000) * params.model.outputCostPer1k;

  return Number((inputCost + outputCost).toFixed(4));
}

export function checkBudgetAllowance(params: {
  user: SessionUser;
  summary: UsageSummary;
  model: ModelConfig;
}) {
  const remainingUsd = Number(
    (params.user.budget.monthlyUsdLimit - params.summary.totalCostUsd).toFixed(4),
  );
  const softWarningReached = params.summary.totalCostUsd >= params.user.budget.softWarningUsd;
  const blocked = remainingUsd <= 0;

  return {
    remainingUsd,
    softWarningReached,
    blocked,
    message: blocked
      ? `本月预算已用尽，当前限制为 $${params.user.budget.monthlyUsdLimit.toFixed(2)}。`
      : softWarningReached
        ? `本月已进入预算预警区，剩余约 $${remainingUsd.toFixed(2)}。`
        : `当前模型 ${params.model.label} 可继续使用。`,
  };
}

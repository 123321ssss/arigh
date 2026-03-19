import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const admin = await requireAdmin();
  const { key } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const model = await appRepository.updateModel(key, {
    ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
    ...(typeof body.defaultSystemPrompt === "string"
      ? { defaultSystemPrompt: body.defaultSystemPrompt }
      : {}),
    ...(typeof body.providerModelId === "string"
      ? { providerModelId: body.providerModelId }
      : {}),
    ...(typeof body.monthlyBudgetUsd === "number"
      ? { monthlyBudgetUsd: body.monthlyBudgetUsd }
      : {}),
  });

  if (!model) {
    return NextResponse.json({ error: "Model not found." }, { status: 404 });
  }

  await appRepository.addAuditLog(
    admin.id,
    "model.update",
    `更新模型 ${model.label} 的配置。`,
  );

  return NextResponse.json(model);
}

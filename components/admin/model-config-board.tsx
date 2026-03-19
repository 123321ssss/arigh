"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import type { ModelConfig } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ModelConfigBoard({ models }: { models: ModelConfig[] }) {
  const router = useRouter();

  async function updateModel(key: string, payload: Partial<ModelConfig>) {
    await fetch(`/api/admin/models/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {models.map((model) => (
        <div
          key={model.key}
          className="rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-white/78 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--ink-strong)]">{model.label}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{model.description}</p>
            </div>
            <Button
              type="button"
              variant={model.enabled ? "secondary" : "danger"}
              size="sm"
              onClick={() => updateModel(model.key, { enabled: !model.enabled })}
            >
              {model.enabled ? "已启用" : "已停用"}
            </Button>
          </div>
          <div className="mt-5 grid gap-3">
            <Input
              defaultValue={model.providerModelId}
              placeholder="Provider model id"
              onBlur={(event) =>
                updateModel(model.key, {
                  providerModelId: event.target.value,
                })
              }
            />
            <Input
              defaultValue={model.monthlyBudgetUsd}
              type="number"
              step="0.01"
              onBlur={(event) =>
                updateModel(model.key, {
                  monthlyBudgetUsd: Number(event.target.value),
                })
              }
            />
            <Textarea
              defaultValue={model.defaultSystemPrompt}
              className="min-h-[120px]"
              onBlur={(event) =>
                updateModel(model.key, {
                  defaultSystemPrompt: event.target.value,
                })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { startTransition, useState } from "react";

import type { ConversationSummary, ModelConfig } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

function Root({ children }: { children: React.ReactNode }) {
  return <Panel className="flex h-full flex-col gap-4 p-4">{children}</Panel>;
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function Item({
  conversation,
  selected,
  onDelete,
}: {
  conversation: ConversationSummary;
  selected: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group rounded-[24px] border p-4 transition",
        selected
          ? "border-[rgba(50,156,149,0.36)] bg-[rgba(50,156,149,0.12)]"
          : "border-[rgba(19,31,30,0.08)] bg-white/70 hover:border-[rgba(19,31,30,0.16)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/app/c/${conversation.id}`} className="min-w-0 flex-1">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-[var(--ink-strong)]">
                {conversation.title}
              </p>
              <Badge className="bg-transparent px-2 py-0.5 tracking-[0.18em]">
                最近 {conversation.lastUsedModelKey}
              </Badge>
            </div>
            <p className="line-clamp-2 text-xs leading-6 text-[var(--muted)]">
              {conversation.lastPreview}
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              默认模型 {conversation.defaultModelKey}
            </p>
          </div>
        </Link>
        <button
          type="button"
          className="rounded-full p-2 text-[var(--muted)] opacity-0 transition hover:bg-[rgba(181,90,74,0.1)] hover:text-[var(--danger)] group-hover:opacity-100"
          onClick={() => onDelete(conversation.id)}
          aria-label="删除会话"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
        <span>{formatDateTime(conversation.updatedAt)}</span>
        <span>{formatCurrency(conversation.estimatedCostUsd)}</span>
      </div>
    </div>
  );
}

export const ConversationRail = {
  Root,
  List,
  Item,
};

export function ConversationRailCard({
  conversations,
  selectedConversationId,
  defaultModel,
}: {
  conversations: ConversationSummary[];
  selectedConversationId?: string;
  defaultModel: ModelConfig;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function createConversation() {
    setIsPending(true);
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelKey: defaultModel.key }),
    });
    setIsPending(false);

    if (!response.ok) {
      return;
    }

    const conversation = (await response.json()) as ConversationSummary;
    startTransition(() => {
      router.push(`/app/c/${conversation.id}`);
      router.refresh();
    });
  }

  async function deleteConversation(id: string) {
    const response = await fetch(`/api/conversations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    startTransition(() => {
      if (selectedConversationId === id) {
        router.push("/app");
      }
      router.refresh();
    });
  }

  return (
    <ConversationRail.Root>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Conversations</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
            会话目录
          </h2>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={createConversation}
          disabled={isPending}
        >
          <Plus className="h-4 w-4" />
          新建
        </Button>
      </div>
      <ConversationRail.List>
        {conversations.map((conversation) => (
          <ConversationRail.Item
            key={conversation.id}
            conversation={conversation}
            selected={conversation.id === selectedConversationId}
            onDelete={deleteConversation}
          />
        ))}
      </ConversationRail.List>
    </ConversationRail.Root>
  );
}

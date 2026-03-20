import { Bot, Wrench } from "lucide-react";
import type { UIMessage } from "ai";

import { AvatarChip } from "@/components/ui/avatar-chip";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import type { MessageMeta, SessionUser } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

function renderPart(part: UIMessage["parts"][number], index: number) {
  if (part.type === "text") {
    return (
      <p key={index} className="whitespace-pre-wrap text-sm leading-7">
        {part.text}
      </p>
    );
  }

  if (part.type.startsWith("tool-")) {
    const toolName = part.type.replace("tool-", "");
    const status =
      "state" in part && typeof part.state === "string" ? part.state : "unknown";

    return (
      <div
        key={index}
        className="rounded-[22px] border border-[rgba(19,31,30,0.08)] bg-[rgba(255,255,255,0.7)] p-4"
      >
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <Wrench className="h-3.5 w-3.5" />
          <span>{toolName}</span>
          <span>{status}</span>
        </div>
        {"input" in part ? (
          <pre className="overflow-auto rounded-2xl bg-[rgba(19,31,30,0.05)] p-3 text-xs leading-6 text-[var(--ink)]">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        ) : null}
        {"output" in part && part.output ? (
          <pre className="mt-3 overflow-auto rounded-2xl bg-[rgba(50,156,149,0.08)] p-3 text-xs leading-6 text-[var(--ink)]">
            {JSON.stringify(part.output, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  }

  return null;
}

function readMetadata(metadata: UIMessage["metadata"]) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  return metadata as MessageMeta;
}

export function ChatThread({
  messages,
  user,
}: {
  messages: UIMessage[];
  user: SessionUser;
}) {
  return (
    <Panel className="min-h-[520px] flex-1 space-y-5 overflow-hidden p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Conversation Stream
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
            对话实录
          </h2>
        </div>
        <Badge>{messages.length} 条消息</Badge>
      </div>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-[rgba(19,31,30,0.12)] bg-[rgba(255,255,255,0.55)] p-10 text-center text-sm leading-7 text-[var(--muted)]">
            从下方输入一个任务，系统会把流式输出、工具调用和成本记录落在同一条工作线上。
          </div>
        ) : null}
        {messages.map((message) => {
          const isUser = message.role === "user";
          const metadata = readMetadata(message.metadata);

          return (
            <div
              key={message.id}
              className={cn(
                "grid gap-3 md:grid-cols-[52px_minmax(0,1fr)]",
                isUser && "md:grid-cols-[minmax(0,1fr)_52px]",
              )}
            >
              {!isUser ? <AvatarChip fallback="AI" /> : <div className="hidden md:block" />}
              <div
                className={cn(
                  "rounded-[28px] border px-5 py-4",
                  isUser
                    ? "order-first border-[rgba(19,31,30,0.08)] bg-[rgba(19,31,30,0.92)] text-[var(--paper)] md:order-none"
                    : "border-[rgba(19,31,30,0.08)] bg-white/82 text-[var(--ink-strong)]",
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isUser ? (
                      <AvatarChip image={user.avatarUrl} fallback={user.displayName.slice(0, 1)} />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(50,156,149,0.12)] text-[var(--ink-strong)]">
                        <Bot className="h-5 w-5" />
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {isUser ? user.displayName : "Editorial Agent"}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isUser ? "text-[rgba(255,252,244,0.62)]" : "text-[var(--muted)]",
                        )}
                      >
                        {isUser ? "成员输入" : metadata?.modelLabel ?? "助手输出"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {metadata?.modelLabel && !isUser ? (
                      <Badge>{metadata.modelLabel}</Badge>
                    ) : null}
                    <Badge
                      className={cn(
                        isUser
                          ? "border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,252,244,0.72)]"
                          : undefined,
                      )}
                    >
                      {message.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">{message.parts.map(renderPart)}</div>
              </div>
              {isUser ? (
                <div className="hidden md:flex md:justify-end">
                  <AvatarChip image={user.avatarUrl} fallback={user.displayName.slice(0, 1)} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import type { PromptTemplate } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PromptLibrary({ prompts }: { prompts: PromptTemplate[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("运营");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  async function createPrompt() {
    if (!name || !content) {
      return;
    }

    await fetch("/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, description, content }),
    });

    setName("");
    setDescription("");
    setContent("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-white/78 p-5">
        <Input placeholder="模板名称" value={name} onChange={(event) => setName(event.target.value)} />
        <Input
          placeholder="分类"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <Input
          placeholder="用途说明"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Textarea
          placeholder="模板正文"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button type="button" className="w-full" onClick={createPrompt}>
          新建模板
        </Button>
      </div>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="rounded-[26px] border border-[rgba(19,31,30,0.08)] bg-white/78 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink-strong)]">{prompt.name}</h3>
                <p className="text-sm text-[var(--muted)]">{prompt.description}</p>
              </div>
              <span className="rounded-full bg-[rgba(50,156,149,0.12)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--ink-strong)]">
                {prompt.category}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
              {prompt.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

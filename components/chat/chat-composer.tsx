"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { createContext, startTransition, use, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import type { UIMessage } from "ai";

import type { ModelConfig, PromptTemplate, SessionUser } from "@/lib/domain/types";
import { ChatThread } from "@/components/chat/chat-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";

type ChatComposerContextValue = {
  state: {
    input: string;
    modelKey: string;
    promptTemplateId: string;
    status: string;
    error?: string;
    messages: UIMessage[];
  };
  actions: {
    setInput: (value: string) => void;
    setModelKey: (value: string) => void;
    setPromptTemplateId: (value: string) => void;
    submit: () => Promise<void>;
  };
  meta: {
    models: ModelConfig[];
    prompts: PromptTemplate[];
    user: SessionUser;
    conversationId: string;
  };
};

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null);

function useChatComposerContext() {
  const value = use(ChatComposerContext);
  if (!value) {
    throw new Error("ChatComposer components must be used inside AgentChatComposer.");
  }
  return value;
}

function Provider({
  value,
  children,
}: {
  value: ChatComposerContextValue;
  children: React.ReactNode;
}) {
  return <ChatComposerContext value={value}>{children}</ChatComposerContext>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return <Panel className="space-y-4 p-5">{children}</Panel>;
}

function InputField() {
  const {
    state: { input, status, error },
    actions: { setInput, submit },
  } = useChatComposerContext();

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        await submit();
      }}
    >
      <Textarea
        value={input}
        placeholder="输入一个要执行的任务，例如：整理今天的会议纪要、生成上线检查清单、总结本周模型成本。"
        onChange={(event) => setInput(event.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--muted)]">
          {error ? (
            <span className="text-[var(--danger)]">{error}</span>
          ) : (
            "支持流式回复、短任务 Agent 和逐消息模型切换。"
          )}
        </div>
        <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {status === "submitted" || status === "streaming" ? "streaming" : "ready"}
        </div>
      </div>
    </form>
  );
}

function Controls() {
  const {
    state: { modelKey, promptTemplateId, status, messages },
    actions: { setModelKey, setPromptTemplateId, submit },
    meta: { models, prompts, user },
  } = useChatComposerContext();

  const deferredMessages = useDeferredValue(messages);
  const estimatedDraftCost = deferredMessages.length * 0.0125;

  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <div className="space-y-2 xl:col-span-4">
        <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          本次消息模型
        </label>
        <Select value={modelKey} onChange={(event) => setModelKey(event.target.value)}>
          {models.map((model) => (
            <option key={model.key} value={model.key}>
              {model.label} / {model.enabled ? "可用" : "停用"}
            </option>
          ))}
        </Select>
        <p className="text-xs text-[var(--muted)]">
          切换只影响下一条发送，不会重写历史消息。
        </p>
      </div>
      <div className="space-y-2 xl:col-span-4">
        <label className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          提示模板
        </label>
        <Select
          value={promptTemplateId}
          onChange={(event) => setPromptTemplateId(event.target.value)}
        >
          <option value="">不使用模板</option>
          {prompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col justify-end gap-2 xl:col-span-4">
        <Button
          type="button"
          className="w-full"
          onClick={submit}
          disabled={status === "submitted" || status === "streaming"}
        >
          {status === "submitted" || status === "streaming" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          发送任务
        </Button>
        <Badge className="justify-center border-[rgba(19,31,30,0.08)]">
          {user.displayName} / 草稿成本约 {formatCurrency(estimatedDraftCost)}
        </Badge>
      </div>
    </div>
  );
}

export const ChatComposer = {
  Provider,
  Frame,
  InputField,
  Controls,
};

export function AgentChatComposer({
  conversationId,
  initialMessages,
  models,
  prompts,
  user,
  defaultModelKey,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  models: ModelConfig[];
  prompts: PromptTemplate[];
  user: SessionUser;
  defaultModelKey: string;
}) {
  const router = useRouter();
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat/stream" }));
  const [input, setInput] = useState("");
  const [modelKey, setModelKey] = useState(defaultModelKey);
  const [promptTemplateId, setPromptTemplateId] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    transport,
    onFinish() {
      startTransition(() => {
        router.refresh();
      });
    },
  });

  async function submit() {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    await sendMessage(
      { text: trimmed },
      {
        body: {
          conversationId,
          modelKey,
          promptTemplateId: promptTemplateId || null,
        },
      },
    );

    setInput("");
  }

  return (
    <ChatComposer.Provider
      value={{
        state: {
          input,
          modelKey,
          promptTemplateId,
          status,
          error: error?.message,
          messages,
        },
        actions: {
          setInput,
          setModelKey,
          setPromptTemplateId,
          submit,
        },
        meta: {
          models,
          prompts,
          user,
          conversationId,
        },
      }}
    >
      <ChatComposer.Frame>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Agent Composer
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
              输入区
            </h3>
          </div>
          <Badge
            className={cn(status === "streaming" ? "border-[rgba(50,156,149,0.28)]" : undefined)}
          >
            {status}
          </Badge>
        </div>
        <ChatComposer.InputField />
        <ChatComposer.Controls />
      </ChatComposer.Frame>
    </ChatComposer.Provider>
  );
}

export function AgentChatWorkspace(props: {
  conversationId: string;
  initialMessages: UIMessage[];
  models: ModelConfig[];
  prompts: PromptTemplate[];
  user: SessionUser;
  defaultModelKey: string;
}) {
  const router = useRouter();
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat/stream" }));
  const [input, setInput] = useState("");
  const [modelKey, setModelKey] = useState(props.defaultModelKey);
  const [promptTemplateId, setPromptTemplateId] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    messages: props.initialMessages,
    transport,
    onFinish() {
      startTransition(() => {
        router.refresh();
      });
    },
  });

  async function submit() {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    await sendMessage(
      { text: trimmed },
      {
        body: {
          conversationId: props.conversationId,
          modelKey,
          promptTemplateId: promptTemplateId || null,
        },
      },
    );

    setInput("");
  }

  const value: ChatComposerContextValue = {
    state: {
      input,
      modelKey,
      promptTemplateId,
      status,
      error: error?.message,
      messages,
    },
    actions: {
      setInput,
      setModelKey,
      setPromptTemplateId,
      submit,
    },
    meta: {
      models: props.models,
      prompts: props.prompts,
      user: props.user,
      conversationId: props.conversationId,
    },
  };

  return (
    <ChatComposer.Provider value={value}>
      <div className="grid gap-5">
        <ChatThread messages={messages} user={props.user} />
        <ChatComposer.Frame>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Agent Composer
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink-strong)]">
                输入区
              </h3>
            </div>
            <Badge
              className={cn(status === "streaming" ? "border-[rgba(50,156,149,0.28)]" : undefined)}
            >
              {status}
            </Badge>
          </div>
          <ChatComposer.InputField />
          <ChatComposer.Controls />
        </ChatComposer.Frame>
      </div>
    </ChatComposer.Provider>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

export function SetupCard({ bootstrapToken }: { bootstrapToken?: string | null }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("这一步只用于创建首个管理员账号。创建完成后，后续成员统一走邀请码注册。");
  const [loading, setLoading] = useState(false);

  async function createAdmin() {
    if (!displayName.trim() || !email.trim() || !password) {
      setMessage("请完整填写显示名、邮箱和密码。");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/bootstrap-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        token: bootstrapToken,
      }),
    });
    setLoading(false);

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; redirectTo?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "初始化失败，请检查配置后重试。");
      return;
    }

    router.push(payload?.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <Panel className="space-y-5 rounded-[34px] p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Setup</p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
          初始化管理员
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{message}</p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await createAdmin();
        }}
      >
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="管理员显示名"
        />
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="管理员邮箱"
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="管理员密码"
          autoComplete="new-password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "创建中..." : "创建管理员"}
        </Button>
      </form>
    </Panel>
  );
}

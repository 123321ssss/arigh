"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

export function RegisterCard({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("邀请码仅用于首次注册，注册成功后直接使用邮箱和密码登录。");
  const [loading, setLoading] = useState(false);

  const registerLink = useMemo(() => {
    const value = code.trim();
    return value ? `/register?invite=${encodeURIComponent(value)}` : "/register";
  }, [code]);

  async function register() {
    if (!code.trim() || !displayName.trim() || !email.trim() || !password) {
      setMessage("请完整填写邀请码、昵称、邮箱和密码。");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register-with-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      }),
    });
    setLoading(false);

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; redirectTo?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "注册失败，请稍后重试。");
      return;
    }

    router.push(payload?.redirectTo ?? "/app");
    router.refresh();
  }

  return (
    <Panel className="space-y-5 rounded-[34px] p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Register</p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
          用邀请码注册
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{message}</p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await register();
        }}
      >
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="邀请码"
          autoComplete="off"
        />
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="显示名"
          autoComplete="nickname"
        />
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="邮箱"
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="设置密码"
          autoComplete="new-password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "注册中..." : "完成注册"}
        </Button>
      </form>
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
        <Link href="/login" className="underline underline-offset-4">
          已有账号，去登录
        </Link>
        <Link href={registerLink} className="underline underline-offset-4">
          当前注册链接
        </Link>
      </div>
    </Panel>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

type LoginCardProps = {
  showDemoAccess: boolean;
};

export function LoginCard({ showDemoAccess }: LoginCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    showDemoAccess
      ? "本地仍保留演示账号；真实环境使用邮箱和密码登录。"
      : "请输入管理员或成员账号的邮箱与密码。",
  );
  const [loading, setLoading] = useState(false);

  async function loginDemo(role: "admin" | "member") {
    setLoading(true);
    const response = await fetch("/api/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoading(false);

    if (!response.ok) {
      setMessage("演示登录失败，请重试。");
      return;
    }

    router.push(role === "admin" ? "/admin" : "/app");
    router.refresh();
  }

  async function signIn() {
    if (!email.trim() || !password) {
      setMessage("请完整输入邮箱和密码。");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/password-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });
    setLoading(false);

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; redirectTo?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "登录失败，请稍后重试。");
      return;
    }

    router.push(payload?.redirectTo ?? "/app");
    router.refresh();
  }

  return (
    <Panel className="space-y-5 rounded-[34px] p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Sign In</p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
          登录工作台
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{message}</p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await signIn();
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="企业邮箱"
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="登录密码"
          autoComplete="current-password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </Button>
      </form>
      <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
        <Link href="/register" className="underline underline-offset-4">
          用邀请码注册
        </Link>
        <Link href="/setup" className="underline underline-offset-4">
          初始化管理员
        </Link>
      </div>
      {showDemoAccess ? (
        <div className="space-y-3 rounded-[28px] border border-[rgba(19,31,30,0.08)] bg-[rgba(19,31,30,0.04)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            演示入口
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => loginDemo("member")}
              disabled={loading}
            >
              以成员身份进入
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => loginDemo("admin")}
              disabled={loading}
            >
              以管理员身份进入
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

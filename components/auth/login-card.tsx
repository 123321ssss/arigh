"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

type LoginCardProps = {
  showDemoAccess: boolean;
};

export function LoginCard({ showDemoAccess }: LoginCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    showDemoAccess
      ? "使用演示账号可直接进入界面验证。"
      : "请输入可收邮件的邮箱，点击下方按钮后去邮箱打开登录链接。",
  );
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

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

  async function requestMagicLink() {
    if (!email || !supabase) {
      setMessage(
        showDemoAccess
          ? "当前未配置 Supabase，请先使用演示账号。"
          : "当前 Supabase 尚未配置完整，请检查环境变量和控制台设置。",
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("魔法链接已发送，请检查企业邮箱。");
  }

  return (
    <Panel className="space-y-5 rounded-[34px] p-7">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Sign In
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
          登录工作台
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{message}</p>
      </div>
      <div className="grid gap-3">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="输入你能收邮件的邮箱"
        />
        <Button type="button" onClick={requestMagicLink} disabled={loading}>
          {loading ? "发送中..." : "发送登录链接"}
        </Button>
        <p className="text-xs leading-6 text-[var(--muted)]">
          这是登录按钮。邮件发出后，去你的邮箱点开链接即可完成登录。
        </p>
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

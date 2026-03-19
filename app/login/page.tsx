import Link from "next/link";

import { LoginCard } from "@/components/auth/login-card";
import { getAuthMode } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";

export default function LoginPage() {
  const showDemoAccess = getAuthMode() === "demo";

  return (
    <div className="min-h-screen bg-[var(--paper)] px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1400px] gap-5 lg:grid-cols-[1fr_0.88fr]">
        <section className="rounded-[40px] border border-[rgba(19,31,30,0.1)] bg-[rgba(21,27,27,0.94)] p-8 text-[var(--paper)] shadow-[0_32px_110px_rgba(5,9,9,0.32)] md:p-10">
          <Badge className="border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[rgba(255,250,242,0.72)]">
            邀请制内部系统
          </Badge>
          <div className="mt-8 max-w-2xl space-y-5">
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.05]">
              让成员只面对任务，
              <br />
              让管理员只面对控制面。
            </h1>
            <p className="text-base leading-8 text-[rgba(255,250,242,0.72)]">
              首版支持企业邮箱魔法链接、管理员邀请、模型开关、提示词模板、预算和审计面板。
              {showDemoAccess
                ? " 若你还没接好 Supabase，本地也可以先用演示账号直接验证。"
                : " 当前已经切到 Supabase 登录模式，可直接使用企业邮箱完成首次接入。"}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Panel className="rounded-[28px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 text-[var(--paper)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[rgba(255,250,242,0.52)]">
                成员默认
              </p>
              <p className="mt-2 text-sm leading-7 text-[rgba(255,250,242,0.72)]">
                只看自己的会话和资料，管理员默认不查看正文内容。
              </p>
            </Panel>
            <Panel className="rounded-[28px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 text-[var(--paper)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[rgba(255,250,242,0.52)]">
                管理员默认
              </p>
              <p className="mt-2 text-sm leading-7 text-[rgba(255,250,242,0.72)]">
                只看聚合统计、邀请、预算和审计事件，不提供正文浏览器。
              </p>
            </Panel>
          </div>
          <div className="mt-10">
            <Link href="/">
              <span className="text-sm text-[rgba(255,250,242,0.7)] underline underline-offset-4">
                返回首页
              </span>
            </Link>
          </div>
        </section>
        <div className="flex items-center">
          <LoginCard showDemoAccess={showDemoAccess} />
        </div>
      </div>
    </div>
  );
}

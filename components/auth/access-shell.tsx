import Link from "next/link";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";

function Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1440px] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        {children}
      </div>
    </div>
  );
}

function Stage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const cards = [
    {
      icon: KeyRound,
      title: "邀请码准入",
      description: "管理员生成邀请码或注册链接，成员首次注册后使用邮箱与密码直接登录。",
    },
    {
      icon: ShieldCheck,
      title: "后台控制",
      description: "管理员维护模型目录、预算阈值、成员状态和邀请码生命周期。",
    },
    {
      icon: Sparkles,
      title: "逐消息切模型",
      description: "同一会话里每条消息都可切换不同 GPT 模型，系统按实际调用记账。",
    },
  ];

  return (
    <section className="rounded-[40px] border border-[rgba(19,31,30,0.1)] bg-[rgba(21,27,27,0.94)] p-8 text-[var(--paper)] shadow-[0_32px_110px_rgba(5,9,9,0.32)] md:p-10">
      <Badge className="border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[rgba(255,250,242,0.72)]">
        {eyebrow}
      </Badge>
      <div className="mt-8 max-w-2xl space-y-5">
        <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.04] text-[var(--paper)]">
          {title}
        </h1>
        <p className="text-base leading-8 text-[rgba(255,250,242,0.72)]">{description}</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Panel
              key={card.title}
              className="rounded-[28px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 text-[var(--paper)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[rgba(255,250,242,0.84)]">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-base font-semibold">{card.title}</p>
              <p className="mt-2 text-sm leading-7 text-[rgba(255,250,242,0.68)]">
                {card.description}
              </p>
            </Panel>
          );
        })}
      </div>
      <div className="mt-10">
        <Link
          href="/"
          className="text-sm text-[rgba(255,250,242,0.74)] underline underline-offset-4"
        >
          返回首页
        </Link>
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

export const AccessShell = {
  Root,
  Stage,
  Card,
};

import Link from "next/link";
import { ArrowRight, KeyRound, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const featureCards = [
  {
    icon: KeyRound,
    title: "邀请码准入",
    description: "网站可以公开展示，但成员注册必须持有管理员生成的邀请码或注册链接。",
  },
  {
    icon: Sparkles,
    title: "逐消息切模型",
    description: "成员在同一会话里按消息切换 GPT 模型，后台按真实调用模型记账与审计。",
  },
  {
    icon: Workflow,
    title: "短任务 Agent",
    description: "内置计算、时钟、白名单抓取和提示模板查询工具，适合内部短链路任务。",
  },
];

export default function HomePage() {
  return (
    <div className="grain min-h-screen bg-[var(--paper)] px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1500px] gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal delay={0.05}>
          <section className="relative overflow-hidden rounded-[42px] border border-[rgba(19,31,30,0.12)] bg-[rgba(255,250,242,0.8)] p-7 shadow-[0_30px_100px_rgba(21,31,31,0.1)] md:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[rgba(77,178,170,0.18)] blur-3xl" />
            <Badge>Editorial AI Console</Badge>
            <div className="mt-8 max-w-3xl space-y-6">
              <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.02] tracking-[0.02em] text-[var(--ink-strong)] md:text-7xl">
                面向内部团队的
                <br />
                AI 对话工作台
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
                管理员维护成员、邀请码、模型目录和预算规则；成员在统一工作区发起对话、调用短任务
                Agent，并按消息切换不同 GPT 模型。公开的是官网，受控的是准入。
              </p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg">
                  登录工作台
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  用邀请码注册
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="ghost" size="lg">
                  初始化管理员
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {featureCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <Reveal key={card.title} delay={0.14 + index * 0.08}>
                    <Panel className="h-full rounded-[28px] border-[rgba(19,31,30,0.08)] bg-white/72 p-5">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(77,178,170,0.12)] text-[var(--ink-strong)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className="mt-4 text-lg font-semibold text-[var(--ink-strong)]">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {card.description}
                      </p>
                    </Panel>
                  </Reveal>
                );
              })}
            </div>
          </section>
        </Reveal>
        <Reveal delay={0.12}>
          <section className="grid gap-5">
            <Panel className="rounded-[38px] bg-[rgba(21,27,27,0.94)] p-7 text-[var(--paper)] shadow-[0_32px_110px_rgba(5,9,9,0.32)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,250,242,0.58)]">
                Roles
              </p>
              <div className="mt-5 space-y-5">
                <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                  <p className="font-[family-name:var(--font-display)] text-3xl">Admin</p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(255,250,242,0.72)]">
                    管理员创建邀请码、调整成员状态、维护模型可用性、预算上限和系统提示词。
                  </p>
                  <div className="mt-4">
                    <Link href="/admin">
                      <Button variant="ghost" className="text-[rgba(255,250,242,0.82)] hover:bg-[rgba(255,255,255,0.08)]">
                        打开后台
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                  <p className="font-[family-name:var(--font-display)] text-3xl">Member</p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(255,250,242,0.72)]">
                    成员按会话协作，逐消息切换 GPT 模型，保留个人历史、Agent 轨迹和成本记录。
                  </p>
                  <div className="mt-4">
                    <Link href="/app">
                      <Button variant="ghost" className="text-[rgba(255,250,242,0.82)] hover:bg-[rgba(255,255,255,0.08)]">
                        打开成员区
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel className="rounded-[34px] p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Deployment</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                低成本部署
              </h2>
              <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--muted)]">
                <p>原型环境：Vercel Hobby + Supabase + 单一 OpenAI-compatible provider</p>
                <p>稳定环境：Next standalone + Docker/Nginx + 自有域名 + 服务端统一出海</p>
              </div>
            </Panel>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

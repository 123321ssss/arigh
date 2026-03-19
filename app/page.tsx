import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "管理员视角",
    description: "邀请成员、控制模型预算、查看聚合统计与审计事件，不默认读取成员正文。",
  },
  {
    icon: Sparkles,
    title: "成员工作区",
    description: "沉浸式流式对话、Prompt 模板、低成本模型切换，以及会话级 Agent 轨迹。",
  },
  {
    icon: Workflow,
    title: "短任务 Agent",
    description: "内置计算、时钟、白名单抓取和模板查询工具，限制步数与成本边界。",
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
                为内部团队设计的
                <br />
                AI 对话控制台
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
                成员专注对话与短任务 Agent，管理员掌控预算、模型、账号与审计。界面按“编辑部控制台”视觉语言构建，适合中国大陆团队先跑零成本原型，再迁移到稳定生产部署。
              </p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg">
                  进入登录页
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app">
                <Button variant="secondary" size="lg">
                  直接查看成员工作区
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
                    邀请成员，配置默认模型与预算，查看成本曲线、审计流与最近活动。
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
                    发起对话、调用短任务 Agent、选择 Prompt 模板，并保留私有历史。
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
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Deploy</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)]">
                双轨部署
              </h2>
              <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--muted)]">
                <p>
                  原型环境: `Vercel Hobby + Supabase Free + 企业 SMTP`
                </p>
                <p>
                  大陆稳定环境: `Next standalone + Docker/Nginx + 自有域名`
                </p>
              </div>
            </Panel>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

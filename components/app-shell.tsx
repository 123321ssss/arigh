import Link from "next/link";
import {
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings2,
  Shield,
  Users,
} from "lucide-react";

import type { SessionUser } from "@/lib/domain/types";
import { AvatarChip } from "@/components/ui/avatar-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellRootProps = {
  children: React.ReactNode;
  tone: "member" | "admin";
};

function Root({ children, tone }: AppShellRootProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden",
        tone === "admin" ? "bg-[var(--admin-surface)]" : "bg-[var(--paper)]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(50,156,149,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(181,90,74,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(19,31,30,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(19,31,30,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full gap-5 px-3 py-3 md:px-5 md:py-5",
          tone === "admin" ? "max-w-[1700px]" : "max-w-[1880px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden w-[298px] shrink-0 rounded-[34px] border border-[rgba(19,31,30,0.12)] bg-[rgba(21,27,27,0.92)] p-6 text-[var(--paper)] shadow-[0_26px_90px_rgba(6,10,10,0.28)] xl:flex xl:flex-col">
      {children}
    </aside>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return <main className="flex min-w-0 flex-1 flex-col gap-5">{children}</main>;
}

function Header({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="rounded-[34px] border border-[rgba(19,31,30,0.1)] bg-[rgba(255,252,244,0.74)] px-6 py-5 shadow-[0_18px_60px_rgba(21,31,31,0.08)] backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge>{eyebrow}</Badge>
          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)] md:text-[2.65rem]">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
              {subtitle}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

function Aside({ children }: { children: React.ReactNode }) {
  return <aside className="hidden w-[320px] shrink-0 flex-col gap-5 xl:flex">{children}</aside>;
}

export const AppShell = {
  Root,
  Sidebar,
  Main,
  Header,
  Aside,
};

type WorkspaceShellProps = {
  user: SessionUser;
  currentPath: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
};

function WorkspaceNav({
  items,
  currentPath,
}: {
  items: Array<{ href: string; label: string; icon: React.ReactNode }>;
  currentPath: string;
}) {
  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm transition",
              active
                ? "bg-[rgba(50,156,149,0.18)] text-white"
                : "text-[rgba(255,252,244,0.76)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white",
            )}
          >
            <span className="opacity-90">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function WorkspaceSidebar({
  user,
  currentPath,
  items,
  badgeText,
}: {
  user: SessionUser;
  currentPath: string;
  items: Array<{ href: string; label: string; icon: React.ReactNode }>;
  badgeText: string;
}) {
  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <Badge className="border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] text-[rgba(255,252,244,0.72)]">
            {badgeText}
          </Badge>
          <div>
            <p className="font-[family-name:var(--font-display)] text-[2rem] tracking-[0.04em]">
              Editorial
            </p>
            <p className="text-sm text-[rgba(255,252,244,0.62)]">
              Internal AI workspace and controls
            </p>
          </div>
        </div>
        <WorkspaceNav items={items} currentPath={currentPath} />
      </div>
      <div className="mt-auto space-y-4 rounded-[28px] border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] p-4">
        <div className="flex items-center gap-3">
          <AvatarChip image={user.avatarUrl} fallback={user.displayName.slice(0, 1)} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.displayName}</p>
            <p className="truncate text-xs text-[rgba(255,252,244,0.58)]">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[rgba(255,252,244,0.7)]">
          <span>Monthly budget</span>
          <span>${user.budget.monthlyUsdLimit.toFixed(2)}/mo</span>
        </div>
        <form action="/api/auth/logout" method="post">
          <Button
            variant="ghost"
            className="w-full justify-between rounded-2xl text-[rgba(255,252,244,0.8)] hover:bg-[rgba(255,255,255,0.08)]"
          >
            Sign out
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}

export function MemberWorkspaceShell({
  user,
  currentPath,
  title,
  subtitle,
  children,
  aside,
}: WorkspaceShellProps) {
  const items = [
    { href: "/app", label: "对话工作台", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/settings/profile", label: "个人设置", icon: <Settings2 className="h-4 w-4" /> },
  ];

  return (
    <AppShell.Root tone="member">
      <AppShell.Main>
        <header className="rounded-[34px] border border-[rgba(19,31,30,0.1)] bg-[linear-gradient(145deg,rgba(255,252,244,0.9),rgba(244,237,225,0.84))] px-5 py-5 shadow-[0_18px_60px_rgba(21,31,31,0.08)] backdrop-blur md:px-7 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge>Member Workspace</Badge>
              <Badge className="border-[rgba(19,31,30,0.12)] bg-[rgba(19,31,30,0.03)]">
                Budget ${user.budget.monthlyUsdLimit.toFixed(2)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-[rgba(19,31,30,0.12)] bg-white/70 px-3 py-2">
                <p className="text-xs text-[var(--muted)]">{user.email}</p>
                <p className="text-sm font-medium text-[var(--ink-strong)]">{user.displayName}</p>
              </div>
              <form action="/api/auth/logout" method="post">
                <Button variant="ghost" className="rounded-2xl">
                  退出
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
          <div className="mt-4 flex w-full gap-2 overflow-x-auto pb-1">
            {items.map((item) => {
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-w-fit items-center gap-2 rounded-2xl px-4 py-2 text-sm transition",
                    active
                      ? "bg-[rgba(19,31,30,0.92)] text-[var(--paper)]"
                      : "border border-[rgba(19,31,30,0.12)] bg-white/70 text-[var(--ink-strong)] hover:bg-white",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-5 space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink-strong)] md:text-[2.55rem]">
              {title}
            </h1>
            <p className="max-w-4xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
              {subtitle}
            </p>
          </div>
        </header>
        {children}
        {aside ? <div className="grid gap-5">{aside}</div> : null}
      </AppShell.Main>
    </AppShell.Root>
  );
}

export function AdminWorkspaceShell({
  user,
  currentPath,
  title,
  subtitle,
  children,
  aside,
}: WorkspaceShellProps) {
  const items = [
    { href: "/admin", label: "总览", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/members", label: "成员与邀请码", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/models", label: "模型目录", icon: <Bot className="h-4 w-4" /> },
    { href: "/admin/prompts", label: "提示模板", icon: <FileText className="h-4 w-4" /> },
    { href: "/admin/usage", label: "用量", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin/audit", label: "审计", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <AppShell.Root tone="admin">
      <AppShell.Sidebar>
        <WorkspaceSidebar
          user={user}
          currentPath={currentPath}
          items={items}
          badgeText="管理员控制台"
        />
      </AppShell.Sidebar>
      <AppShell.Main>
        <AppShell.Header
          eyebrow="Admin Console"
          title={title}
          subtitle={subtitle}
          actions={
            <Link href="/app">
              <Button variant="secondary">切换成员视角</Button>
            </Link>
          }
        />
        {children}
      </AppShell.Main>
      {aside ? <AppShell.Aside>{aside}</AppShell.Aside> : null}
    </AppShell.Root>
  );
}

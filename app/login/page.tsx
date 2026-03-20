import type { Metadata } from "next";

import { AccessShell } from "@/components/auth/access-shell";
import { LoginCard } from "@/components/auth/login-card";
import { getAuthMode } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "登录",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  const showDemoAccess = getAuthMode() === "demo";

  return (
    <AccessShell.Root>
      <AccessShell.Stage
        eyebrow="内部团队准入"
        title="让成员面对任务，让管理员面对控制面。"
        description="公开首页负责展示，登录页只承担准入。管理员先初始化首个账号，再通过后台生成邀请码或注册链接，把成员逐步引入同一套工作台。"
      />
      <AccessShell.Card>
        <LoginCard showDemoAccess={showDemoAccess} />
      </AccessShell.Card>
    </AccessShell.Root>
  );
}

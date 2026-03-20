import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessShell } from "@/components/auth/access-shell";
import { SetupCard } from "@/components/auth/setup-card";
import { canAccessSetup } from "@/lib/auth/bootstrap";

export const metadata: Metadata = {
  title: "初始化管理员",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const allowed = await canAccessSetup(token);

  if (!allowed) {
    notFound();
  }

  return (
    <AccessShell.Root>
      <AccessShell.Stage
        eyebrow="一次性初始化"
        title="先建立管理员，再开放邀请码。"
        description="首个管理员由部署者直接创建。创建完成后，成员与后续管理员都改由邀请码和后台权限分配进入，不再依赖邮件魔法链接。"
      />
      <AccessShell.Card>
        <SetupCard bootstrapToken={token ?? null} />
      </AccessShell.Card>
    </AccessShell.Root>
  );
}

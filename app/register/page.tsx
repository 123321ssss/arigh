import type { Metadata } from "next";

import { AccessShell } from "@/components/auth/access-shell";
import { RegisterCard } from "@/components/auth/register-card";

export const metadata: Metadata = {
  title: "邀请码注册",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialCode = Array.isArray(params.invite) ? params.invite[0] : params.invite;

  return (
    <AccessShell.Root>
      <AccessShell.Stage
        eyebrow="邀请码注册"
        title="公开官网，受控注册。"
        description="任何人都可以访问官网，但只有拿到邀请码的人才能注册。邀请码只在首次注册时消费，后续统一改为邮箱和密码登录。"
      />
      <AccessShell.Card>
        <RegisterCard initialCode={initialCode ?? ""} />
      </AccessShell.Card>
    </AccessShell.Root>
  );
}

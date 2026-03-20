import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "魔法链接登录已废弃，请改用邮箱密码或邀请码注册。" },
    { status: 410 },
  );
}

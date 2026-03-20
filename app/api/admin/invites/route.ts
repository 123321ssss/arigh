import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "邮箱邀请已废弃，请改用 /api/admin/invite-codes。" },
    { status: 410 },
  );
}

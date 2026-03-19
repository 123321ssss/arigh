import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function GET() {
  await requireAdmin();
  const summary = await appRepository.getUsageSummary();

  return NextResponse.json(summary);
}

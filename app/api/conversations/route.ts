import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { modelKey?: string };
  const defaultModel = await appRepository.getDefaultModel();
  const conversation = await appRepository.createConversation(
    user.id,
    body.modelKey ?? defaultModel.key,
  );

  await appRepository.addAuditLog(
    user.id,
    "chat.stream",
    `创建了新会话 \`${conversation.title}\`。`,
  );

  return NextResponse.json(conversation);
}

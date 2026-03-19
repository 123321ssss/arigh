import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const body = (await request.json()) as {
    title?: string;
    status?: "active" | "archived";
  };
  const conversation = await appRepository.updateConversation(id, user.id, body);

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const deleted = await appRepository.deleteConversation(id, user.id);

  if (!deleted) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

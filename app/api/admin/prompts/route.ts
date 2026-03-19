import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/session";
import { appRepository } from "@/lib/data/repository";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as {
    name?: string;
    category?: string;
    description?: string;
    content?: string;
  };

  if (!body.name || !body.content || !body.category || !body.description) {
    return NextResponse.json({ error: "Invalid prompt payload." }, { status: 400 });
  }

  const prompt = await appRepository.createPrompt({
    name: body.name,
    category: body.category,
    description: body.description,
    content: body.content,
  });

  await appRepository.addAuditLog(
    admin.id,
    "prompt.create",
    `创建提示词模板 ${prompt.name}。`,
  );

  return NextResponse.json(prompt);
}

import { beforeEach, describe, expect, it } from "vitest";

import { appRepository } from "@/lib/data/repository";
import { createDemoState } from "@/lib/domain/seed";

describe("conversation ownership", () => {
  beforeEach(() => {
    globalThis.__EDITORIAL_AI_DEMO_STATE__ = createDemoState();
  });

  it("returns null when a different user opens someone else's conversation", async () => {
    const conversation = await appRepository.getConversationForUser(
      "conv-001",
      "user-admin-1",
    );

    expect(conversation).toBeNull();
  });

  it("returns messages for the owner", async () => {
    const messages = await appRepository.listMessagesForConversation(
      "conv-001",
      "user-member-1",
    );

    expect(messages.length).toBeGreaterThan(0);
  });
});

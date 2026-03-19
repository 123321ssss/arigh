import type { UIMessage } from "ai";
import { createUIMessageStreamResponse } from "ai";

export function createMockChatResponse(params: {
  originalMessages: UIMessage[];
  responseText: string;
}) {
  const responseMessageId = crypto.randomUUID();

  const nextMessages: UIMessage[] = [
    ...params.originalMessages,
    {
      id: responseMessageId,
      role: "assistant",
      parts: [{ type: "text", text: params.responseText }],
    },
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue({ type: "text-start", id: responseMessageId });
      controller.enqueue({
        type: "text-delta",
        id: responseMessageId,
        delta: params.responseText,
      });
      controller.enqueue({ type: "text-end", id: responseMessageId });
      controller.enqueue({ type: "finish-step" });
      controller.enqueue({ type: "finish" });
      controller.close();
    },
  });

  return {
    response: createUIMessageStreamResponse({ stream }),
    messages: nextMessages,
    responseMessage: nextMessages[nextMessages.length - 1],
  };
}

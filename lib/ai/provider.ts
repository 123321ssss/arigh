import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import type { ModelConfig } from "@/lib/domain/types";
import { env, isAiConfigured } from "@/lib/env";

export function getLanguageModel(model: ModelConfig) {
  if (!isAiConfigured()) {
    return null;
  }

  const provider = createOpenAICompatible({
    name: env.AI_PROVIDER_NAME,
    baseURL: env.AI_BASE_URL!,
    apiKey: env.AI_API_KEY,
    includeUsage: true,
  });

  return provider(model.providerModelId);
}

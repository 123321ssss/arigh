import { describe, expect, it } from "vitest";

import { buildToolSet } from "@/lib/ai/tools";

describe("tool whitelist", () => {
  it("rejects domains outside the allow list", async () => {
    const tools = await buildToolSet();

    await expect(
      tools.http_fetch_whitelist.execute({
        url: "https://example.com/private",
      }),
    ).rejects.toThrow("目标域名不在管理员白名单中。");
  });
});

import { z } from "zod";

import { appRepository } from "@/lib/data/repository";

function evaluateExpression(expression: string) {
  if (!/^[\d\s()+\-*/%.]+$/.test(expression)) {
    throw new Error("只允许数字和基础运算符。");
  }

  // Controlled expression evaluator for basic arithmetic only.
  const value = Function(`"use strict"; return (${expression});`)();
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("表达式未得到有效数值。");
  }

  return value;
}

export async function buildToolSet() {
  const policy = await appRepository.getToolPolicy();

  return {
    calculator: {
      description: "执行基础算术表达式，适合预算估算与比率计算。",
      inputSchema: z.object({
        expression: z.string().min(1),
      }),
      execute: async ({ expression }: { expression: string }) => {
        const result = evaluateExpression(expression);

        return {
          expression,
          result,
        };
      },
    },
    clock: {
      description: "返回指定时区的当前时间。",
      inputSchema: z.object({
        timezone: z.string().default("Asia/Shanghai"),
      }),
      execute: async ({ timezone }: { timezone: string }) => {
        return {
          timezone,
          now: new Intl.DateTimeFormat("zh-CN", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: timezone,
          }).format(new Date()),
        };
      },
    },
    http_fetch_whitelist: {
      description: "获取管理员白名单域名下的网页文本。",
      inputSchema: z.object({
        url: z.string().url(),
      }),
      execute: async ({ url }: { url: string }) => {
        const parsed = new URL(url);
        const allowed = policy.allowedHttpDomains.some(
          (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
        );

        if (!allowed) {
          throw new Error("目标域名不在管理员白名单中。");
        }

        const response = await fetch(url, {
          signal: AbortSignal.timeout(6000),
          headers: {
            "User-Agent": "Editorial-AI-Console/1.0",
          },
        });

        const text = await response.text();

        return {
          status: response.status,
          url,
          excerpt: text.slice(0, 1200),
        };
      },
    },
    prompt_template_lookup: {
      description: "查询管理员维护的提示词模板。",
      inputSchema: z.object({
        query: z.string().min(1),
      }),
      execute: async ({ query }: { query: string }) => {
        const templates = await appRepository.listPromptTemplates();
        const hits = templates
          .filter((template) =>
            [template.name, template.category, template.description, template.content]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 5)
          .map((template) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description,
          }));

        return {
          query,
          count: hits.length,
          hits,
        };
      },
    },
  };
}

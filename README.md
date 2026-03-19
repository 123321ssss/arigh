# Editorial AI Console

内部团队 AI 对话平台原型，包含成员工作区、管理员后台、邀请制账号管理、模型与提示词配置、短任务 Agent、成本统计与审计流。

## Stack

- `Next.js 16` + `React 19` + `TypeScript`
- `Tailwind CSS 4`
- `Vercel AI SDK` + `OpenAI-compatible provider`
- `Supabase SSR/Auth` 预留接入
- `Drizzle ORM` + PostgreSQL schema
- `Playwright` + `Vitest`

## Local Run

1. 安装依赖: `npm install`
2. 复制环境变量: `copy .env.example .env.local`
3. 本地原型直接运行: `npm run dev`
4. 打开 [http://localhost:3000](http://localhost:3000)

默认 `APP_DEMO_MODE=true`，没有 Supabase 和真实 AI 密钥也能跑通成员区、后台、流式 demo reply 和审计面。

## Commands

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:push`

## Auth Modes

- Demo 模式: `/login` 页面直接用“成员/管理员”按钮进入。
- Supabase 模式: 配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，再接企业 SMTP 与 `/auth/callback`。

## AI Modes

- 未配置 `AI_BASE_URL` + `AI_API_KEY` 时，`/api/chat/stream` 返回本地演示流。
- 配置后自动切到真实 `OpenAI-compatible` 流式对话，并启用工具调用。

## Key Files

- `app/api/chat/stream/route.ts`: 聊天流式入口、预算检查、工具调用、审计与记账
- `lib/data/repository.ts`: 当前演示仓库与数据访问边界
- `lib/data/schema.ts`: PostgreSQL/Drizzle 数据模型
- `components/chat/*`: 对话区、Agent 轨迹、组合式输入区
- `components/admin/*`: 管理后台面板、成员表、模型与模板配置
- `docs/technical-design.md`: 详细技术设计

## Verification

当前仓库已通过:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

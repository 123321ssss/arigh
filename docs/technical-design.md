# Technical Design

## 1. Product Shape

本项目是内部团队 AI 工作台，角色只有 `admin` 与 `member`。成员进入 `/app` 与 `/app/c/[id]` 进行对话、选择模型、调用提示词模板，并在同页查看 Agent 执行轨迹。管理员进入 `/admin` 系列页面管理账号、模型、模板、成本与审计。

首版只做会话内短任务 Agent，不做文件问答、长任务队列、浏览器自动化和多租户隔离。

## 2. Frontend Architecture

前端采用 `App Router + Server Components` 为主，聊天输入和后台表格操作使用客户端岛屿。视觉方向固定为“编辑部控制台”:

- 纸感米白背景 + 炭黑面板
- 青绿色强调色，棕红危险色
- 中文 serif display 字体搭配高可读 sans
- 非对称布局，左深色导航、右浅色工作面

组合模式遵循 Vercel Composition Patterns:

- `AppShell` 使用 compound component 拆分 `Root / Sidebar / Main / Header / Aside`
- `ChatComposer` 用 `Provider + Frame + InputField + Controls`
- `MemberWorkspaceShell` 与 `AdminWorkspaceShell` 是显式变体，不靠 `isAdmin` 布尔 prop 切逻辑

## 3. Data and Auth

当前运行时默认使用 `lib/data/repository.ts` 的 demo repository，方便零配置本地演示。生产落地时切换到 `DATABASE_URL + Drizzle + Postgres`，表结构已经在 `lib/data/schema.ts` 中定义:

- `profiles`
- `invites`
- `conversations`
- `messages`
- `agent_runs`
- `model_configs`
- `prompt_templates`
- `tool_policies`
- `usage_events`
- `audit_logs`

消息正文和 Agent payload 按应用层加密思路处理，示例加密在 `lib/security/crypto.ts`。

鉴权支持两条路径:

- Demo: `editorial_ai_demo_session` cookie
- Supabase SSR: `/auth/callback` 交换 session cookie

## 4. Chat Lifecycle

`POST /api/chat/stream` 的生命周期如下:

1. 读取当前用户和会话
2. 检查模型可用状态
3. 聚合 `usage_events` 执行预算检查
4. 先保存用户最新消息快照
5. 根据环境决定走真实 provider 还是 demo stream
6. 记录 `agent_runs`
7. 写入 `usage_events`
8. 写入 `audit_logs`

真实模式使用 `Vercel AI SDK + createOpenAICompatible()`，并启用以下工具:

- `calculator`
- `clock`
- `http_fetch_whitelist`
- `prompt_template_lookup`

Agent 约束:

- `stopWhen: stepCountIs(4)`
- `maxRetries: 1`
- 不进后台队列

## 5. Deployment

### Prototype

- `Vercel Hobby`
- `Supabase Free`
- 企业 SMTP

### Mainland-stable

- `next build` 产出 standalone
- Docker 部署到国内云主机
- Nginx 反代
- 浏览器只访问自有域名
- 服务端再访问 Supabase / AI Provider

## 6. Testing

单元测试覆盖:

- 权限 guard
- 预算检查
- 成本估算
- provider adapter
- 工具白名单
- 加密解密
- 会话归属

浏览器测试覆盖:

- 成员登录、进入会话、发送消息、看到流式 demo reply
- 管理员登录、访问成员页和用量页

执行命令:

- `npm run test:unit`
- `npm run test:e2e`

# 跨界简历 - 给AI求职者的AI通关简历

面向 AI 企业求职的简历优化平台：上传简历 → AI 按岗位 JD 润色 → 版本管理 → 简历库 → AI 求职顾问 → 自动抓取 AI 公司招聘信息。

## 技术栈

- [TanStack Start](https://tanstack.com/start)（React 19 全栈框架，文件路由 + Server Functions）
- [Better Auth](https://better-auth.com) 认证（Drizzle 适配器）
- [Drizzle ORM](https://orm.drizzle.team) + Cloudflare D1（本地与生产均使用 D1，本地由 wrangler 模拟）
- Tailwind CSS v4
- 部署：Cloudflare Workers（自定义入口 + D1 + Cron）

## 本地开发

本地 dev 同样运行在 Cloudflare workerd 上，数据库为本地模拟的 D1（数据位于 `.wrangler/state/v3/d1/`）。

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 配置环境变量（复制到 `.dev.vars`，已被 git 忽略）：

   ```env
   # LLM API Key（简历修改 / AI 顾问 / JD 抓取使用）
   DEEPSEEK_API_KEY=

   # Better Auth 配置
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET= # 生成方式：npx -y @better-auth/cli secret
   ```

3. 初始化本地 D1 数据库（迁移 + 种子数据）：

   ```bash
   pnpm db:d1:migrate:local
   pnpm db:d1:seed:local
   ```

4. 启动开发服务器：

   ```bash
   pnpm dev
   ```

   访问 http://localhost:3000

## 部署到 Cloudflare

### 1. 创建 D1 数据库

```bash
pnpm db:d1:create
```

创建完成后，将输出中的 `database_id` 替换到 [wrangler.jsonc](wrangler.jsonc) 的 `d1_databases[0].database_id` 占位符中。

### 2. 应用数据库迁移

```bash
pnpm db:d1:migrate
```

### 3. 导入种子数据（公司 / 简历库模板，可选）

```bash
pnpm db:d1:seed
```

### 4. 配置生产环境变量

在 Cloudflare Dashboard（或通过 `wrangler secret put`）设置以下 Secret：

- `DEEPSEEK_API_KEY`
- `BETTER_AUTH_URL`（生产域名）
- `BETTER_AUTH_SECRET`

### 5. 部署

```bash
pnpm deploy
```

部署成功后：

- Worker 名称：`ai-passkey`
- 路由：所有 `*` 请求由 [src/server.ts](src/server.ts) 处理（来自 `@tanstack/react-start/server-entry`）
- Cron 定时任务：每天 08:00（UTC）触发 [src/lib/jd-fetcher.ts](src/lib/jd-fetcher.ts) 的 `runFetchAll()` 自动抓取 JD（`triggers.crons` 可调整）

### 本地 / 生产统一使用 D1

本地 dev 与生产均运行在 Cloudflare workerd 上，[src/db/index.ts](src/db/index.ts) 统一通过 `cloudflare:workers` 的 `env.DB` 访问 D1，无本地 / 生产驱动切换逻辑。本地 D1 由 wrangler 模拟（`--local`），数据不落盘到项目目录。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发（workerd + 本地 D1 模拟） |
| `pnpm build` | 生产构建 |
| `pnpm deploy` | 构建并部署到 Cloudflare |
| `pnpm db:generate` | 根据 schema 生成迁移文件 |
| `pnpm db:d1:migrate:local` | 应用迁移到本地 D1 |
| `pnpm db:d1:seed:local` | 导入种子数据到本地 D1 |
| `pnpm db:d1:migrate` | 应用迁移到远程 D1 |
| `pnpm db:d1:seed` | 导入种子数据到远程 D1 |
| `pnpm cf:typegen` | 重新生成 Worker 类型声明 |

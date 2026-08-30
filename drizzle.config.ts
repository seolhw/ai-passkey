import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  // url 仅供 drizzle-kit generate 使用（不连接数据库）；
  // 迁移与初始化统一通过 wrangler d1 管理（本地 --local / 远程 --remote）
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
})

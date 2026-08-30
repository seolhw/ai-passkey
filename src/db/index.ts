import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema.ts";

/** 统一对外暴露的 D1 数据库接口（本地 workerd 与生产均为 Cloudflare D1） */
export type AppDb = DrizzleD1Database<typeof schema>;

/** 通过 cloudflare:workers 的 env.DB 读取 D1 绑定（vite-ignore 确保只在 workerd 运行时加载） */
export const db: AppDb = await createWorkerDb();

async function createWorkerDb(): Promise<AppDb> {
  const { env } = await import(/* @vite-ignore */ "cloudflare:workers");
  const { drizzle } = await import("drizzle-orm/d1");
  return drizzle(env.DB, { schema });
}

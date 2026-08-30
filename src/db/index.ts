import { config } from "dotenv";

config({ path: [".env.local", ".env"] });

import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema.ts";

/** 统一对外暴露的异步 SQLite 数据库接口（本地 better-sqlite3 也按此契约使用） */
export type AppDb = DrizzleD1Database<typeof schema>;

/** 本地 dev 通过 DATABASE_URL 使用 better-sqlite3；Cloudflare 生产使用 D1。
 *  两类驱动均使用动态 import（vite-ignore），确保原生模块不会进入 worker 生产 bundle，
 *  cloudflare:workers 只在 workerd 运行时按需加载。 */
const isLocal = typeof process !== "undefined" && !!process.env.DATABASE_URL;

export const db: AppDb = isLocal
	? await createLocalDb()
	: await createWorkerDb();

async function createLocalDb(): Promise<AppDb> {
	const { drizzle } = await import("drizzle-orm/better-sqlite3");
	const Database = (await import("better-sqlite3")).default;
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("本地模式缺少 DATABASE_URL 环境变量");
	}
	return drizzle(new Database(databaseUrl), {
		schema,
	}) as unknown as AppDb;
}

async function createWorkerDb(): Promise<AppDb> {
	const { env } = await import(/* @vite-ignore */ "cloudflare:workers");
	const { drizzle } = await import("drizzle-orm/d1");
	return drizzle(env.DB, { schema });
}

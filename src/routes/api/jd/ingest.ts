/* eslint-disable no-console */
// 开发者专用 JD 录入接口（手动录入岗位 JD 到本地/线上 D1）。
// 只允许开发者访问：请求头必须携带 x-ingest-key，与服务端配置的 JD_INGEST_KEY 一致。
//   - 本地开发：在 .dev.vars 中配置 JD_INGEST_KEY
//   - 生产：wrangler secret put JD_INGEST_KEY
// 未配置密钥时接口直接返回 503（拒绝一切访问）。
//
// 请求：POST /api/jd/ingest
// Header：x-ingest-key: <JD_INGEST_KEY>
// Body：
//   {
//     "companyId": 1,              // 与 companyName 二选一
//     "companyName": "字节跳动",    // 找不到公司返回 404
//     "title": "大模型算法工程师",   // 必填
//     "jd": "岗位职责…",            // 必填
//     "salaryMin": 24,             // 年薪万元（可选）
//     "salaryMax": 48,
//     "jobType": "full_time",      // full_time / intern / campus
//     "experience": "3-5年",
//     "education": "硕士",
//     "workMode": "现场",          // 远程 / 混合 / 现场
//     "sourceUrl": "https://...",
//     "tags": ["LLM", "RAG"],
//     "cities": ["北京"],
//     "publishedAt": "2023-08-14"
//   }
// 按 companyId + title 去重：已存在则更新（JD、薪资、标签、城市），否则插入。
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db/index";
import { companies, jobCities, jobs, jobTags } from "#/db/schema";
import { env } from "#/env";

/** 归一化发布时间：支持 ISO 字符串 / unix 秒 / 毫秒，统一转为 unix 秒 */
function toEpochSeconds(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    return Math.floor(value > 1e12 ? value / 1000 : value);
  }
  const t = new Date(String(value)).getTime();
  return Number.isNaN(t) ? null : Math.floor(t / 1000);
}

const ingestSchema = z.object({
  companyId: z.number().int().positive().optional(),
  companyName: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  jd: z.string(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  publishedAt: z.union([z.string(), z.number()]).nullable().optional(),
  jobType: z.string().nullable().optional(),
  experience: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  workMode: z.string().nullable().optional(),
  status: z.enum(["open", "closed"]).default("open"),
  sourceUrl: z.string().nullable().optional(),
  source: z.string().default("manual"),
  tags: z.array(z.string().max(50)).max(20).default([]),
  cities: z.array(z.string().max(50)).max(10).default([]),
});

/** 统一 JSON 响应 */
function json(data: unknown, init?: { status?: number }) {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/jd/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1) 开发者密钥校验
        const serverKey = env.JD_INGEST_KEY;
        if (!serverKey) {
          return json({ error: "服务端未配置 JD_INGEST_KEY，录入接口已关闭" }, { status: 503 });
        }
        const providedKey = request.headers.get("x-ingest-key");
        if (!providedKey || providedKey !== serverKey) {
          return json({ error: "x-ingest-key 无效" }, { status: 401 });
        }

        // 2) 解析并校验请求体
        const raw: unknown = await request.json().catch(() => null);
        if (!raw) return json({ error: "请求体不是合法 JSON" }, { status: 400 });
        const parsed = ingestSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ error: "参数不合法", detail: parsed.error.flatten() }, { status: 400 });
        }
        const body = parsed.data;

        // 3) 定位公司
        let companyId = body.companyId;
        if (!companyId) {
          if (!body.companyName) {
            return json({ error: "companyId 与 companyName 必须提供其一" }, { status: 400 });
          }
          const row = await db.query.companies.findFirst({
            where: eq(companies.name, body.companyName),
            columns: { id: true },
          });
          if (!row) return json({ error: `公司不存在：${body.companyName}` }, { status: 404 });
          companyId = row.id;
        }

        // 4) 按 companyId + title 去重写入（已存在则更新）
        const existing = await db.query.jobs.findFirst({
          where: and(eq(jobs.companyId, companyId), eq(jobs.title, body.title)),
          columns: { id: true },
        });
        const publishedAtEpoch = toEpochSeconds(body.publishedAt);
        const values = {
          companyId,
          title: body.title,
          jd: body.jd,
          salaryMin: body.salaryMin ?? null,
          salaryMax: body.salaryMax ?? null,
          publishedAt: publishedAtEpoch != null ? new Date(publishedAtEpoch * 1000) : null,
          jobType: body.jobType ?? null,
          experience: body.experience ?? null,
          education: body.education ?? null,
          workMode: body.workMode ?? null,
          status: body.status,
          sourceUrl: body.sourceUrl ?? null,
          source: body.source,
        };

        let jobId: number;
        let updated = false;
        if (existing) {
          await db.update(jobs).set(values).where(eq(jobs.id, existing.id)).run();
          jobId = existing.id;
          updated = true;
        } else {
          const [row] = await db.insert(jobs).values(values).returning({ id: jobs.id }).all();
          jobId = row.id;
        }

        // 5) 重建标签与城市
        await db.delete(jobTags).where(eq(jobTags.jobId, jobId)).run();
        await db.delete(jobCities).where(eq(jobCities.jobId, jobId)).run();
        for (const tag of body.tags) await db.insert(jobTags).values({ jobId, tag }).run();
        for (const city of body.cities) await db.insert(jobCities).values({ jobId, city }).run();

        return json({ id: jobId, inserted: !updated, updated });
      },
    },
  },
});

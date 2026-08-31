import { chat, toolDefinition } from "@tanstack/ai";
import { convert } from "purifai";
import { z } from "zod";

import { LLM_LIST } from "#/constants/models";
import { db } from "#/db/index";
import { companies, jobCities, jobs, jobTags } from "#/db/schema";
import { deepseekAdapter, extractJson } from "#/lib/llm";

/** 一个抓取源的配置（国内 AI 公司统一走 AI 抓取） */
export type JdSourceConfig = {
  name: string;
  /** AI 抓取时使用的官方招聘页面 URL */
  url: string;
  /** 官网 */
  website?: string;
  /** 大模型团队列表 */
  models?: string[];
};

/** 国内 AI 公司：由 AI 抓取官网招聘页并分析整理 */
const DEFAULT_SOURCES: JdSourceConfig[] = LLM_LIST.map((m) => ({
  name: m.company,
  url: m.careerUrl,
  website: m.website,
  models: m.models,
}));

/** 页面 HTML → 可读纯文本（purifai 解析，输出上限 8000 字符，超限截断） */
function stripHtml(html: string) {
  return convert(html, {
    layout: "readable",
    limits: { output: 8000 },
    overflow: "truncate",
  }).text;
}

/** 执行全量抓取：按源入库（去重），更新抓取状态 */
export async function runFetchAll() {
  const results: {
    source: string;
    ok: boolean;
    count: number;
    error?: string;
  }[] = [];

  for (const config of DEFAULT_SOURCES) {
    try {
      const fetched = await fetchSource(config);
      const company = await getOrCreateCompany(config);
      let count = 0;
      for (const job of fetched) {
        const exists = await db.query.jobs.findFirst({
          where: (t, { and, eq }) =>
            and(eq(t.companyId, company.id), eq(t.title, job.title)),
        });
        if (!exists) {
          const [inserted] = await db
            .insert(jobs)
            .values({
              companyId: company.id,
              title: job.title.slice(0, 200),
              jd: job.jd,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              jobType: job.jobType,
              experience: job.experience,
              education: job.education,
              sourceUrl: job.sourceUrl,
              source: "fetch",
            })
            .returning();
          if (job.tags.length) {
            await db
              .insert(jobTags)
              .values(job.tags.map((tag) => ({ jobId: inserted.id, tag })));
          }
          if (job.cities.length) {
            await db
              .insert(jobCities)
              .values(
                job.cities.map((city) => ({ jobId: inserted.id, city })),
              );
          }
          count++;
        }
      }
      results.push({ source: config.name, ok: true, count });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      results.push({ source: config.name, ok: false, count: 0, error: msg });
    }
  }
  return results;
}

async function getOrCreateCompany({ name, website, models }: JdSourceConfig) {
  let company = await db.query.companies.findFirst({
    where: (t, { eq }) => eq(t.name, name),
  });
  if (!company) {
    const [created] = await db
      .insert(companies)
      .values({ name, website, models })
      .returning();
    company = created;
  }
  return company;
}

// ============================================================
// AI 官网抓取：由 AI 抓取官网招聘页并分析整理在招岗位
// ============================================================

const AI_FETCH_SYSTEM_PROMPT = `你是一位招聘信息采集助手，负责从指定 AI 公司的官方招聘渠道整理真实的在招岗位。

工作流程：
1. 先用 fetchUrl 工具访问给定的官方招聘页面。
2. 如果页面内容为空或未直接列出岗位，从页面内容中找出岗位列表页 / 详情页链接，用 fetchUrl 继续抓取。
3. 从抓取到的内容中提取在招岗位，优先 AI / 算法 / 工程 / 产品 类岗位。
4. 每个岗位整理：岗位名称、JD（职责 + 要求，300 字以内）、薪资（换算成年薪万元区间，页面未标注则省略，严禁编造）、工作地点（拆成城市数组）、岗位类型（full_time 社招 / intern 实习 / campus 校招）、经验要求、学历要求、技能标签（最多 10 个）、岗位详情页 URL。

要求：
- 只返回页面真实存在的岗位，严禁编造。
- 最多返回 30 个岗位。
- 最后一步只输出一个 JSON 对象（不要代码块、不要附加任何文字），结构为：
{
  "jobs": [
    { "title": "岗位名称", "jd": "JD 摘要", "salaryMin": 30, "salaryMax": 70, "jobType": "full_time", "experience": "3-5年", "education": "硕士", "tags": ["PyTorch", "RAG"], "cities": ["北京", "上海"], "sourceUrl": "岗位详情页 URL" }
  ]
}。`;

/** AI 调用的页面抓取工具：返回去除 HTML 标签后的纯文本 */
const fetchUrlTool = toolDefinition({
  name: "fetchUrl",
  description:
    "抓取指定 URL 的网页内容，返回去除 HTML 标签后的纯文本（最多 8000 字符）。用于访问公司官方招聘页面及其子页面。",
  inputSchema: z.object({
    url: z.string().describe("要抓取的页面完整 URL"),
  }),
  outputSchema: z.object({
    text: z.string().describe("页面纯文本内容（前 8000 字符）"),
  }),
}).server(async ({ url }) => {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`页面抓取失败: ${res.status}`);
  return { text: stripHtml(await res.text()) };
});

const aiFetchSchema = z.object({
  jobs: z
    .array(
      z.object({
        title: z.string(),
        jd: z.string(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        jobType: z.enum(["full_time", "intern", "campus"]).optional(),
        experience: z.string().optional(),
        education: z.string().optional(),
        tags: z.array(z.string()).max(10).default([]),
        cities: z.array(z.string()).max(5).default([]),
        sourceUrl: z.string().optional(),
      }),
    )
    .max(15),
});

async function fetchWithAi({
  company,
  careerUrl,
}: {
  company: string;
  careerUrl: string;
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    const text = await chat({
      adapter: deepseekAdapter(),
      systemPrompts: [AI_FETCH_SYSTEM_PROMPT],
      messages: [
        {
          role: "user",
          content: `公司：${company}\n官方招聘页面：${careerUrl}`,
        },
      ],
      tools: [fetchUrlTool],
      stream: false,
      agentLoopStrategy: (state) => state.iterationCount < 8,
      abortController: controller,
      modelOptions: {
        response_format: { type: "json_object" },
      },
    });
    const parsed = extractJson(text);
    const result = aiFetchSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("AI 返回内容格式不正确，未解析到岗位");
    }
    return result.data.jobs;
  } finally {
    clearTimeout(timer);
  }
}

/** 按源抓取岗位（当前仅国内 AI 公司） */
async function fetchSource(config: JdSourceConfig) {
  return fetchWithAi({ company: config.name, careerUrl: config.url });
}

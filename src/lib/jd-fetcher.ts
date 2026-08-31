import { chat } from "@tanstack/ai";
import { convert } from "purifai";
import { z } from "zod";

import { LLM_LIST } from "#/constants/models";
import { db } from "#/db/index";
import { companies, jobCities, jobs, jobTags } from "#/db/schema";
import { env } from "#/env";
import { deepseekAdapter, extractJson } from "#/lib/llm";

/** BOSS直聘 全国城市码 */
const BOSS_CITY_NATIONAL = "100010000";

/** 构造 BOSS直聘 职位搜索 URL：全国范围搜索"公司名 AI" */
function bossSearchUrl(company: string) {
  const keyword = `${company.split(/[\s(（]/)[0]} AI`;
  return `https://www.zhipin.com/web/geek/job?${new URLSearchParams({
    query: keyword,
    city: BOSS_CITY_NATIONAL,
  })}`;
}

/** 一个抓取源的配置（国内 AI 公司统一走 BOSS直聘 搜索抓取） */
export type JdSourceConfig = {
  name: string;
  /** BOSS直聘 搜索 URL（"公司名 AI"关键词，全国范围） */
  url: string;
  /** 官网 */
  website?: string;
  /** 大模型团队列表 */
  models?: string[];
};

/** 国内 AI 公司：抓取 BOSS直聘 搜索"公司名 AI"的结果，由 AI 分析整理 */
const DEFAULT_SOURCES: JdSourceConfig[] = LLM_LIST.map((m) => ({
  name: m.company,
  url: bossSearchUrl(m.company),
  website: m.website,
  models: m.models,
}));

/** 页面 HTML → 可读纯文本，链接以"文本 (URL)"形式保留，供 AI 定位岗位详情页 URL */
function htmlToText(html: string, baseUrl: string, limit = 30000) {
  return convert(html, {
    layout: "readable",
    links: "label-and-url",
    baseUrl,
    limits: { output: limit },
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
      const company = await db.query.companies.findFirst({
        where: (t, { eq }) => eq(t.name, config.name),
      });
      if (!company) {
        continue;
      }
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
              .values(job.cities.map((city) => ({ jobId: inserted.id, city })));
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

// ============================================================
// BOSS直聘 抓取：渲染搜索结果页，由 AI 分析整理在招岗位
// ============================================================

const AI_BOSS_SYSTEM_PROMPT = `你是一位招聘信息采集助手，负责从 BOSS直聘 搜索结果页中提取 AI 岗位。

我会给你"公司名 AI"的 BOSS直聘 搜索页文本（岗位卡片：岗位名称、月薪、公司名、经验、学历、城市等标签；岗位名称后括号内附其详情页 URL）。

要求：
- 只提取页面真实存在的岗位，严禁编造。
- 薪资换算：BOSS 显示的是月薪（如 "20-40K"），换算成年薪万元区间（如 20-40K → 24-48 万元；若标注 "·15薪" 则按对应月数计算）。未标注薪资则省略，严禁编造。
- jd：若卡片含职责/要求则如实整理（300 字以内）；否则依据岗位名称与标签概括一两句。
- 经验：如 "3-5年"、"经验不限"；学历：如 "本科"、"硕士"。
- 城市从卡片标签提取（如 "北京·朝阳区" → ["北京"]）。
- 技能标签最多 10 个（如 PyTorch、大模型训练、RAG）。
- 岗位类型：标题含"实习"则为 intern，含"校招/应届"则为 campus，其余为 full_time。
- 最多返回 15 个岗位。
- 只输出一个 JSON 对象（不要代码块、不要附加任何文字），结构为：
{
  "jobs": [
    { "title": "岗位名称", "jd": "JD 摘要", "salaryMin": 24, "salaryMax": 48, "jobType": "full_time", "experience": "3-5年", "education": "本科", "tags": ["PyTorch"], "cities": ["北京"], "sourceUrl": "https://www.zhipin.com/job_detail/xxxx.html" }
  ]
}。`;

/** Browser Run REST 免费额度约 6 次/分钟，模块级串行间隔避免 429 限流 */
let lastBrowserRunAt = 0;

/**
 * 用 Cloudflare Browser Run（headless Chromium）渲染页面，返回 JS 执行完成后的完整 HTML。
 * 解决公司官网是 SPA/JS 渲染、直接 fetch 拿不到岗位列表的问题。
 */
async function browserRunHtml(url: string) {
  const wait = Math.max(0, lastBrowserRunAt + 12_000 - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastBrowserRunAt = Date.now();
  const fetchOnce = async () =>
    fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        },
        // networkidle2：等待至多 2 个网络连接，比 networkidle0 快且 SPA 数据已加载完成
        body: JSON.stringify({
          url,
          gotoOptions: { waitUntil: "networkidle2" },
        }),
      },
    );
  let res = await fetchOnce();
  if (res.status === 429) {
    // 触发限流：等待 60 秒重试一次
    await new Promise((r) => setTimeout(r, 60_000));
    res = await fetchOnce();
  }
  if (!res.ok) throw new Error(`浏览器渲染失败: HTTP ${res.status}`);
  const data = (await res.json()) as {
    success: boolean;
    result: string;
    errors?: { message: string }[];
  };
  if (!data.success) {
    const msg = data.errors?.[0]?.message ?? "未知错误";
    throw new Error(`浏览器渲染失败: ${msg}`);
  }
  return data.result;
}

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
  pageText,
}: {
  company: string;
  pageText: string;
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 240_000);
  try {
    const text = await chat({
      adapter: deepseekAdapter(),
      systemPrompts: [AI_BOSS_SYSTEM_PROMPT],
      messages: [
        {
          role: "user",
          content: `公司：${company}\n以下是 BOSS直聘 页面内容：\n${pageText}`,
        },
      ],
      stream: false,
      abortController: controller,
      modelOptions: {
        response_format: { type: "json_object" },
        max_tokens: 6000,
      },
    });
    const result = aiFetchSchema.safeParse(extractJson(text));
    if (!result.success) {
      throw new Error("AI 返回内容格式不正确，未解析到岗位");
    }
    return result.data.jobs;
  } finally {
    clearTimeout(timer);
  }
}

/** 按源抓取岗位：渲染 BOSS直聘 搜索页后由 AI 分析整理（当前仅国内 AI 公司） */
async function fetchSource(config: JdSourceConfig) {
  const html = await browserRunHtml(config.url);
  const pageText = htmlToText(html, config.url, 15000);
  return fetchWithAi({ company: config.name, pageText });
}

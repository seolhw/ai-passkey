import { eq } from "drizzle-orm";

import { db } from "#/db/index";
import { companies, jdSources, jobs } from "#/db/schema";

/** 招聘系统公开 API 的类型 */
type AtsType = "greenhouse" | "lever" | "ashby" | "generic" | "boss";

/** 一个抓取源的配置 */
export type JdSourceConfig = {
  name: string;
  ats: AtsType;
  /** greenhouse board / lever / ashby 公司名 */
  board?: string;
  /** 通用抓取时的 URL */
  url?: string;
  /** boss 直聘搜索 URL（需要 cookie） */
  cookie?: string;
};

/** 单个岗位结果 */
type FetchedJob = {
  title: string;
  jd: string;
  salary?: string;
  location?: string;
  sourceUrl?: string;
};

const DEFAULT_SOURCES: JdSourceConfig[] = [
  { name: "Anthropic", ats: "greenhouse", board: "anthropic" },
  { name: "Notion", ats: "greenhouse", board: "notion" },
  { name: "GitHub", ats: "greenhouse", board: "github" },
  { name: "Datadog", ats: "greenhouse", board: "datadog" },
  { name: "Stripe", ats: "lever", board: "stripe" },
  { name: "Shopify", ats: "lever", board: "shopify" },
  { name: "OpenAI", ats: "ashby", board: "openai" },
  { name: "Figma", ats: "ashby", board: "figma" },
  {
    name: "字节跳动",
    ats: "generic",
    url: "https://jobs.bytedance.com/campus/position",
  },
  {
    name: "Boss 直聘 AI 岗位",
    ats: "boss",
    url: "https://www.zhipin.com/web/geek/job?query=AI",
    cookie: process.env.BOSS_COOKIE,
  },
];

/** 抓取单个源，返回岗位列表 */
export async function fetchSource(
  config: JdSourceConfig,
): Promise<FetchedJob[]> {
  switch (config.ats) {
    case "greenhouse":
      return await fetchGreenhouse(config.board ?? "");
    case "lever":
      return await fetchLever(config.board ?? "");
    case "ashby":
      return await fetchAshby(config.board ?? "");
    case "generic":
      return await fetchGeneric(config.url ?? "");
    case "boss":
      return await fetchBoss(config.url ?? "", config.cookie);
    default:
      return [];
  }
}

async function fetchGreenhouse(board: string) {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`Greenhouse ${board} 抓取失败: ${res.status}`);
  const data = (await res.json()) as {
    jobs: {
      id: number;
      title: string;
      location: { name?: string } | null;
      absolute_url: string;
      content: string;
    }[];
  };
  return data.jobs.map((j) => ({
    title: j.title,
    jd: stripHtml(j.content),
    location: j.location?.name ?? "",
    sourceUrl: j.absolute_url,
  }));
}

async function fetchLever(board: string) {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${board}?mode=json`,
    {
      headers: { Accept: "application/json" },
    },
  );
  if (!res.ok) throw new Error(`Lever ${board} 抓取失败: ${res.status}`);
  const data = (await res.json()) as {
    text: string;
    categories: { location?: string; commitment?: string };
    hostedUrl: string;
    descriptionPlain: string;
    salaryRange?: { min?: number; max?: number; currency?: string };
  }[];
  return data.map((j) => ({
    title: j.text,
    jd: j.descriptionPlain || j.text,
    location: [j.categories.location, j.categories.commitment]
      .filter(Boolean)
      .join(" · "),
    sourceUrl: j.hostedUrl,
    salary: salaryLabel(j.salaryRange),
  }));
}

async function fetchAshby(board: string) {
  const res = await fetch(
    `https://api.ashbyhq.com/posting-api/job-board/${board}`,
    {
      headers: { Accept: "application/json" },
    },
  );
  if (!res.ok) throw new Error(`Ashby ${board} 抓取失败: ${res.status}`);
  const data = (await res.json()) as {
    jobs: {
      title: string;
      location: string;
      jobUrl: string;
      descriptionHtml: string;
      compensation?: { compensationTierSummary?: string };
    }[];
  };
  return data.jobs.map((j) => ({
    title: j.title,
    jd: stripHtml(j.descriptionHtml || ""),
    location: j.location ?? "",
    sourceUrl: j.jobUrl,
    salary: j.compensation?.compensationTierSummary,
  }));
}

/** 通用 HTML 抓取：提取页面文本作为候选（粗略，通常需人工确认） */
async function fetchGeneric(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`通用抓取失败: ${res.status}`);
  const html = await res.text();
  const text = stripHtml(html).slice(0, 4000);
  return [{ title: "通用页面抓取结果", jd: text, sourceUrl: url }];
}

/** Boss 直聘：依赖用户提供 Cookie（ZLWEB），解析列表页岗位卡片，供人工挑选 */
async function fetchBoss(url: string, cookie?: string) {
  if (!cookie) {
    throw new Error(
      "Boss 直聘需要登录 Cookie，请在 .env.local 设置 BOSS_COOKIE（浏览器登录后复制）",
    );
  }
  const res = await fetch(url, {
    headers: {
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Referer: "https://www.zhipin.com/",
    },
  });
  if (!res.ok) throw new Error(`Boss 直聘抓取失败: ${res.status}`);
  const html = await res.text();

  // 按岗位卡片切块解析（列表页卡片结构：job-card-box）
  const jobs: FetchedJob[] = [];
  const cards = html.split('class="job-card-box"').slice(1);
  for (const card of cards) {
    const title = matchText(card, "job-name");
    if (!title) continue;
    const href = card.match(/href="([^"]*\/job_detail\/[^"]*)"/)?.[1];
    jobs.push({
      title,
      jd: "Boss 直聘岗位详情需登录查看，请点击来源链接确认后使用",
      salary: matchText(card, "salary") || undefined,
      location: matchText(card, "job-area") || undefined,
      sourceUrl: href ? `https://www.zhipin.com${href.split("?")[0]}` : url,
    });
  }
  if (jobs.length > 0) return jobs;

  // 页面结构变化时回退为整页文本，供人工核对
  const text = stripHtml(html).slice(0, 4000);
  return [{ title: "Boss 直聘结果（需人工核对）", jd: text, sourceUrl: url }];
}

/** 提取 HTML 片段中指定 class 元素的文本（不含子标签） */
function matchText(block: string, className: string) {
  const re = new RegExp(`class="[^"]*${className}[^"]*"[^>]*>([^<]+)`);
  return block.match(re)?.[1]?.trim() || "";
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function salaryLabel(range?: {
  min?: number;
  max?: number;
  currency?: string;
}) {
  if (!range?.min && !range?.max) return undefined;
  const c = range.currency ?? "USD";
  const min = range.min ? `$${Math.round(range.min / 1000)}k` : "";
  const max = range.max ? `$${Math.round(range.max / 1000)}k` : "";
  return `${c} ${min}-${max}`.trim();
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
      const company = await getOrCreateCompany(config.name);
      let count = 0;
      for (const job of fetched) {
        const exists = await db.query.jobs.findFirst({
          where: (t, { and, eq }) =>
            and(eq(t.companyId, company.id), eq(t.title, job.title)),
        });
        if (!exists) {
          await db.insert(jobs).values({
            companyId: company.id,
            title: job.title.slice(0, 200),
            jd: job.jd,
            salary: job.salary,
            location: job.location,
            sourceUrl: job.sourceUrl,
            source: config.ats,
          });
          count++;
        }
      }
      results.push({ source: config.name, ok: true, count });
      await upsertSourceStatus(config, true, count, undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      results.push({ source: config.name, ok: false, count: 0, error: msg });
      await upsertSourceStatus(config, false, 0, msg);
    }
  }
  return results;
}

async function getOrCreateCompany(name: string) {
  let company = await db.query.companies.findFirst({
    where: (t, { eq }) => eq(t.name, name),
  });
  if (!company) {
    const [created] = await db.insert(companies).values({ name }).returning();
    company = created;
  }
  return company;
}

async function upsertSourceStatus(
  config: JdSourceConfig,
  ok: boolean,
  count: number,
  error: string | undefined,
) {
  const existing = await db.query.jdSources.findFirst({
    where: (t, { eq }) => eq(t.name, config.name),
  });
  const status = ok ? `success (${count})` : `failed: ${error ?? ""}`;
  if (existing) {
    await db
      .update(jdSources)
      .set({ status, lastFetchedAt: new Date() })
      .where(eq(jdSources.id, existing.id));
  } else {
    await db.insert(jdSources).values({
      name: config.name,
      adapterName: config.ats,
      url: config.url ?? config.board ?? "",
      status,
      lastFetchedAt: new Date(),
    });
  }
}

/** 源状态列表（供管理界面） */
export async function listFetchStatus() {
  const rows = await db.query.jdSources.findMany();
  const map = new Map(rows.map((r) => [r.name, r]));
  return DEFAULT_SOURCES.map((c) => ({
    name: c.name,
    ats: c.ats,
    status: map.get(c.name)?.status ?? "idle",
    lastFetchedAt: map.get(c.name)?.lastFetchedAt ?? null,
  }));
}

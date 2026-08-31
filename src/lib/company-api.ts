import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "#/db/index";
import { companies, jobCities, jobs, jobTags } from "#/db/schema";
import { getSessionUser } from "#/lib/session";

/** 公司列表（含岗位数，按 sort 权重升序，新势力在前） */
export const listCompanies = createServerFn({ method: "GET" }).handler(
  async () => {
    const companyRows = await db.query.companies.findMany({
      orderBy: [asc(companies.sort), asc(companies.name)],
    });
    const jobCounts = await db.query.jobs.findMany({
      columns: { companyId: true },
    });
    const countMap = new Map<number, number>();
    jobCounts.forEach((j) => {
      countMap.set(j.companyId, (countMap.get(j.companyId) ?? 0) + 1);
    });
    return companyRows.map((c) => ({
      ...c,
      jobCount: countMap.get(c.id) ?? 0,
    }));
  },
);

/** 公司详情 + 岗位列表 */
export const getCompanyJobs = createServerFn({ method: "GET" })
  .validator((data: { companyId: number }) => data)
  .handler(async ({ data }) => {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, data.companyId),
    });
    if (!company) return null;
    const jobRows = await db.query.jobs.findMany({
      where: eq(jobs.companyId, data.companyId),
      orderBy: [desc(jobs.createdAt)],
      with: { jobCities: true, jobTags: true },
    });
    return { company, jobs: jobRows };
  });

/** 全部岗位（含公司信息），供选择/浏览 */
export const listJobs = createServerFn({ method: "GET" }).handler(async () => {
  const jobRows = await db.query.jobs.findMany({
    orderBy: [desc(jobs.createdAt)],
    with: { company: true, jobCities: true, jobTags: true },
  });
  return jobRows;
});

/** 手动添加岗位 JD（个人库） */
export const createJob = createServerFn({ method: "POST" })
  .validator(
    (data: {
      companyName: string;
      title: string;
      jd: string;
      salaryMin?: number;
      salaryMax?: number;
      jobType?: string;
      experience?: string;
      education?: string;
      tags?: string[];
      cities?: string[];
      sourceUrl?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) return null;
    // 手动添加岗位 JD 属于私有资产，邮箱未验证时禁止
    if (!user.emailVerified) return null;

    // 查找或创建公司
    let company = await db.query.companies.findFirst({
      where: eq(companies.name, data.companyName.trim()),
    });
    if (!company) {
      const [created] = await db
        .insert(companies)
        .values({ name: data.companyName.trim() })
        .returning();
      company = created;
    }

    const [job] = await db
      .insert(jobs)
      .values({
        companyId: company.id,
        title: data.title.trim(),
        jd: data.jd.trim(),
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        jobType: data.jobType,
        experience: data.experience,
        education: data.education,
        sourceUrl: data.sourceUrl,
        source: "manual",
      })
      .returning();
    if (data.tags?.length) {
      await db
        .insert(jobTags)
        .values(data.tags.map((tag) => ({ jobId: job.id, tag: tag.trim() })));
    }
    if (data.cities?.length) {
      await db
        .insert(jobCities)
        .values(
          data.cities.map((city) => ({ jobId: job.id, city: city.trim() })),
        );
    }
    return job;
  });

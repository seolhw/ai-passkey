import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { ModelInfo } from "#/constants/models";

export const todos = sqliteTable("todos", {
  id: integer({ mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** 用户简历主表 */
export const resumes = sqliteTable(
  "resumes",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    title: text().notNull(),
    content: text().notNull().default(""),
    plainText: text("plain_text").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
  },
  (t) => [index("resumes_user_id_idx").on(t.userId)],
);

/** 简历版本快照 */
export const resumeVersions = sqliteTable(
  "resume_versions",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    resumeId: integer("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    content: text().notNull(),
    plainText: text("plain_text").notNull(),
    note: text(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
  },
  (t) => [index("resume_versions_resume_id_idx").on(t.resumeId)],
);

/** AI 公司（国内） */
export const companies = sqliteTable("companies", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  /** 公司 logo */
  logo: text(),
  /** 排序权重（越小越靠前，手动添加默认 1000 排最后） */
  sort: integer().notNull().default(1000),
  intro: text(),
  /** 官网 */
  website: text(),
  /** 官方招聘页 */
  careerUrl: text("career_url"),
  /** 大模型团队列表（JSON 数组） */
  models: text({ mode: "json" }).$type<ModelInfo[]>().notNull().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** 岗位 JD */
export const jobs = sqliteTable(
  "jobs",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text().notNull(),
    jd: text().notNull(),
    /** 最低年薪（万元） */
    salaryMin: integer("salary_min"),
    /** 最高年薪（万元） */
    salaryMax: integer("salary_max"),
    /** 岗位类型：full_time 社招 / intern 实习 / campus 校招 */
    jobType: text("job_type"),
    /** 经验要求：应届 / 1-3年 / 3-5年 / 5-10年 / 10年以上 */
    experience: text(),
    /** 学历要求：大专 / 本科 / 硕士 / 博士 */
    education: text(),
    /** 工作模式：远程 / 混合 / 现场 */
    workMode: text("work_mode"),
    /** 在招状态：open / closed */
    status: text().notNull().default("open"),
    /** 岗位发布日期（源站发布时间，unix 秒） */
    publishedAt: integer("published_at", { mode: "timestamp" }),
    sourceUrl: text("source_url"),
    source: text().notNull().default("manual"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
  },
  (t) => [index("jobs_company_id_idx").on(t.companyId)],
);

/** 岗位技能标签（多对多） */
export const jobTags = sqliteTable(
  "job_tags",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    tag: text().notNull(),
  },
  (t) => [
    index("job_tags_job_id_idx").on(t.jobId),
    index("job_tags_tag_idx").on(t.tag),
  ],
);

/** 岗位城市（多对多） */
export const jobCities = sqliteTable(
  "job_cities",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    city: text().notNull(),
  },
  (t) => [
    index("job_cities_job_id_idx").on(t.jobId),
    index("job_cities_city_idx").on(t.city),
  ],
);

/** 简历选择的目标岗位（多对多） */
export const resumeTargets = sqliteTable(
  "resume_targets",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    resumeId: integer("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("resume_targets_unique").on(t.resumeId, t.jobId),
    index("resume_targets_resume_id_idx").on(t.resumeId),
  ],
);

/** 简历大厅（优质参考简历） */
export const resumeLibrary = sqliteTable("resume_library", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  industry: text(),
  tags: text(),
  content: text().notNull(),
  featured: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** better-auth 用户表 */
export const user = sqliteTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** better-auth 会话表 */
export const session = sqliteTable("session", {
  id: text().primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text().notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** better-auth 账号绑定表 */
export const account = sqliteTable("account", {
  id: text().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text(),
  issuer: text(),
  password: text(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/** better-auth 验证码表 */
export const verification = sqliteTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

export type Resume = typeof resumes.$inferSelect;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobTag = typeof jobTags.$inferSelect;
export type JobCity = typeof jobCities.$inferSelect;

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  jobTags: many(jobTags),
  jobCities: many(jobCities),
}));

export const jobTagsRelations = relations(jobTags, ({ one }) => ({
  job: one(jobs, { fields: [jobTags.jobId], references: [jobs.id] }),
}));

export const jobCitiesRelations = relations(jobCities, ({ one }) => ({
  job: one(jobs, { fields: [jobCities.jobId], references: [jobs.id] }),
}));

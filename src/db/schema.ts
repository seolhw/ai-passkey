import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

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

/** AI 公司 */
export const companies = sqliteTable("companies", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  intro: text(),
  website: text(),
  logo: text(),
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
    salary: text(),
    location: text(),
    sourceUrl: text("source_url"),
    source: text().notNull().default("manual"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
  },
  (t) => [index("jobs_company_id_idx").on(t.companyId)],
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

/** JD 抓取源配置 */
export const jdSources = sqliteTable("jd_sources", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  adapterName: text("adapter_name").notNull(),
  url: text().notNull(),
  lastFetchedAt: integer("last_fetched_at", { mode: "timestamp" }),
  status: text().notNull().default("idle"),
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

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
}));

import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";

import { db } from "#/db/index";
import { resumes, resumeTargets, resumeVersions } from "#/db/schema";
import { getSessionUser } from "#/lib/session";

/** 当前用户的简历列表 */
export const listResumes = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await getSessionUser();
		if (!user) return [];

		return await db.query.resumes.findMany({
			where: eq(resumes.userId, user.id),
			orderBy: [desc(resumes.updatedAt)],
		});
	},
);

/** 新建简历，返回新简历 */
export const createResume = createServerFn({ method: "POST" })
	.validator(
		(data: { title: string; content: string; plainText: string }) => data,
	)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const title = data.title.trim() || "未命名简历";
		const [resume] = await db
			.insert(resumes)
			.values({
				userId: user.id,
				title,
				content: data.content,
				plainText: data.plainText,
			})
			.returning();

		await db.insert(resumeVersions).values({
			resumeId: resume.id,
			versionNo: 1,
			content: data.content,
			plainText: data.plainText,
			note: "初始版本",
		});

		return resume;
	});

/** 读取单个简历（校验归属） */
export const getResume = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.id), eq(resumes.userId, user.id)),
		});
		return resume ?? null;
	});

/** 保存简历内容并生成新版本 */
export const saveResume = createServerFn({ method: "POST" })
	.validator(
		(data: {
			id: number;
			title: string;
			content: string;
			plainText: string;
			note?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const existing = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.id), eq(resumes.userId, user.id)),
		});
		if (!existing) return null;

		await db
			.update(resumes)
			.set({
				title: data.title.trim() || existing.title,
				content: data.content,
				plainText: data.plainText,
				updatedAt: new Date(),
			})
			.where(eq(resumes.id, data.id));

		const latest = await db.query.resumeVersions.findFirst({
			where: eq(resumeVersions.resumeId, data.id),
			orderBy: [desc(resumeVersions.versionNo)],
		});
		const nextVersion = (latest?.versionNo ?? 0) + 1;

		await db.insert(resumeVersions).values({
			resumeId: data.id,
			versionNo: nextVersion,
			content: data.content,
			plainText: data.plainText,
			note: data.note || `版本 ${nextVersion}`,
		});

		return { success: true, versionNo: nextVersion };
	});

/** 简历版本列表 */
export const listVersions = createServerFn({ method: "GET" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return [];

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.id), eq(resumes.userId, user.id)),
		});
		if (!resume) return [];

		return await db.query.resumeVersions.findMany({
			where: eq(resumeVersions.resumeId, data.id),
			orderBy: [desc(resumeVersions.versionNo)],
		});
	});

/** 回滚到指定版本 */
export const rollbackVersion = createServerFn({ method: "POST" })
	.validator((data: { resumeId: number; versionId: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.resumeId), eq(resumes.userId, user.id)),
		});
		if (!resume) return null;

		const version = await db.query.resumeVersions.findFirst({
			where: eq(resumeVersions.id, data.versionId),
		});
		if (!version) return null;

		await db
			.update(resumes)
			.set({
				content: version.content,
				plainText: version.plainText,
				updatedAt: new Date(),
			})
			.where(eq(resumes.id, data.resumeId));

		return { success: true };
	});

/** 删除简历 */
export const deleteResume = createServerFn({ method: "POST" })
	.validator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.id), eq(resumes.userId, user.id)),
		});
		if (!resume) return null;

		await db.delete(resumes).where(eq(resumes.id, data.id));
		return { success: true };
	});

/** 简历已选目标岗位（含公司与 JD） */
export const listResumeTargets = createServerFn({ method: "GET" })
	.validator((data: { resumeId: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return [];

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.resumeId), eq(resumes.userId, user.id)),
		});
		if (!resume) return [];

		const targets = await db.query.resumeTargets.findMany({
			where: eq(resumeTargets.resumeId, data.resumeId),
		});
		if (targets.length === 0) return [];

		const ids = targets.map((t) => t.jobId);
		const jobRows = await db.query.jobs.findMany({
			where: (table, { inArray }) => inArray(table.id, ids),
			with: { company: true },
		});
		return jobRows;
	});

/** 设置目标岗位（全量覆盖） */
export const setResumeTargets = createServerFn({ method: "POST" })
	.validator((data: { resumeId: number; jobIds: number[] }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const resume = await db.query.resumes.findFirst({
			where: and(eq(resumes.id, data.resumeId), eq(resumes.userId, user.id)),
		});
		if (!resume) return null;

		await db
			.delete(resumeTargets)
			.where(eq(resumeTargets.resumeId, data.resumeId));
		if (data.jobIds.length > 0) {
			await db
				.insert(resumeTargets)
				.values(
					data.jobIds.map((jobId) => ({ resumeId: data.resumeId, jobId })),
				);
		}
		return { success: true };
	});

import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";

import { db } from "#/db/index";
import { resumeLibrary, resumes, resumeVersions } from "#/db/schema";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

/** 简历大厅列表（公开） */
export const listLibraryItems = createServerFn({ method: "GET" }).handler(
	async () => {
		return await db.query.resumeLibrary.findMany({
			orderBy: [desc(resumeLibrary.featured), desc(resumeLibrary.createdAt)],
		});
	},
);

/** 读取大厅简历详情 */
export const getLibraryItem = createServerFn({ method: "GET" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		return (
			(await db.query.resumeLibrary.findFirst({
				where: (t, { eq }) => eq(t.id, data.id),
			})) ?? null
		);
	});

/** 一键复制：把大厅简历复制为「我的简历」并跳到编辑器 */
export const copyLibraryToResume = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number }) => data)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user) return null;

		const item = await db.query.resumeLibrary.findFirst({
			where: (t, { eq }) => eq(t.id, data.id),
		});
		if (!item) return null;

		const plainText = htmlToText(item.content);
		const [resume] = await db
			.insert(resumes)
			.values({
				userId: user.id,
				title: `${item.title}（参考）`,
				content: item.content,
				plainText,
			})
			.returning();

		await db.insert(resumeVersions).values({
			resumeId: resume.id,
			versionNo: 1,
			content: item.content,
			plainText,
			note: "来自简历大厅",
		});

		return resume;
	});

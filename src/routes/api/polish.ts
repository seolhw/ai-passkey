import { chat } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { formatSalary } from "#/lib/job";
import { deepseekAdapter, extractJson } from "#/lib/llm";
import { getResume, listResumeTargets } from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

const PolishSchema = z.object({
  summary: z.string().describe("整体修改思路的简要概括"),
  suggestions: z
    .array(
      z.object({
        section: z.string().describe("所属板块，如 个人简介/工作经历/技能"),
        original: z
          .string()
          .describe("简历原文片段（必须与简历中出现的原文一致）"),
        replacement: z.string().describe("建议改写后的内容"),
        reason: z.string().describe("修改理由，结合目标 JD 说明"),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("修改难度"),
      }),
    )
    .describe("逐条修改建议"),
  weaknesses: z
    .array(
      z.object({
        area: z.string().describe("薄弱知识点/能力领域"),
        detail: z.string().describe("为什么重要、当前差距在哪"),
        advice: z.string().describe("面试前如何重点准备"),
      }),
    )
    .describe("用户相对目标岗位的知识薄弱点"),
});

export const Route = createFileRoute("/api/polish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser();
        if (!user) {
          return new Response(JSON.stringify({ error: "未登录" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const body = (await request.json()) as { resumeId: number };
        const resumeId = Number(body.resumeId);

        const resume = await getResume({ data: { id: resumeId } });
        if (!resume) {
          return new Response(JSON.stringify({ error: "简历不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const targets = await listResumeTargets({ data: { resumeId } });
        if (targets.length === 0) {
          return new Response(JSON.stringify({ error: "请先选择目标岗位" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const resumeText = htmlToText(resume.content) || resume.plainText;
        const jdText = targets
          .map(
            (job, i) =>
              `【岗位${i + 1}】${job.company?.name ?? ""} - ${job.title}\n薪资：${formatSalary(job)}\n${job.jd}`,
          )
          .join("\n\n");

        const SYSTEM_PROMPT = `你是一位资深 AI 行业招聘顾问与简历优化专家。你的任务是根据目标公司的岗位 JD，对用户的简历进行精准优化，让简历能通过 AI 筛选并吸引 HR。

要求：
1. 修改建议必须保留简历原有的真实经历与事实，只优化表达、量化成果、突出与 JD 匹配的关键词。
2. original 字段必须逐字取自简历原文，便于系统做文本替换；replacement 是替换后的完整内容。
3. 不要凭空编造经历、技能或数据。
4. 结合目标 JD 中的关键词与能力要求，指出简历缺少或薄弱的点。
5. 用简体中文输出。
6. 最终只输出一个 JSON 对象，结构为：
{
  "summary": "整体修改思路的简要概括",
  "suggestions": [
    { "section": "所属板块，如 个人简介/工作经历/技能", "original": "简历原文片段（逐字一致）", "replacement": "建议改写后的内容", "reason": "修改理由，结合目标 JD 说明", "difficulty": "easy|medium|hard" }
  ],
  "weaknesses": [
    { "area": "薄弱知识点/能力领域", "detail": "为什么重要、当前差距在哪", "advice": "面试前如何重点准备" }
  ]
}
不要输出代码块或其他任何文字。`;

        try {
          const text = await chat({
            adapter: deepseekAdapter(),
            messages: [
              {
                role: "user",
                content: `以下是目标岗位 JD：\n\n${jdText}\n\n===简历开始===\n${resumeText}\n===简历结束===\n\n请对简历进行逐条优化并分析知识薄弱点。`,
              },
            ],
            systemPrompts: [SYSTEM_PROMPT],
            stream: false,
          });

          const parsed = extractJson(text);
          const result = PolishSchema.safeParse(parsed);
          if (!result.success) {
            throw new Error("AI 返回的 JSON 格式不正确，请重试");
          }

          return new Response(
            JSON.stringify({
              ...result.data,
              provider: "deepseek",
              model: "deepseek-chat",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : "修改失败，请稍后重试",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

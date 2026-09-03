import { chat } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getResumeTemplate } from "#/constants/resume-templates";
import { deepseekAdapter } from "#/lib/llm";
import { getResume } from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

const StyleSchema = z.object({
  resumeId: z.number(),
  /** 所选样式模板 id */
  template: z.string().min(1),
  /** 编辑器当前内容（可能尚未保存），为空时回退到服务端已保存内容 */
  content: z.string().optional(),
  title: z.string().optional(),
});

/** 根据模板 id 生成排版结构规范（供 AI 重排参考） */
function buildTemplateSpec(templateId: string): string {
  const t = getResumeTemplate(templateId);
  return `【所选样式：${t.name}】${t.description}。该样式的排版结构要求：
1. 姓名用一级标题「# 」。
2. 紧接姓名之后，用一段普通文字写出联系方式/求职意向（如 电话 · 邮箱 · 意向岗位）。
3. 板块标题（个人简介、教育背景、工作经历、项目经历、技能特长、自我评价等）用二级标题「## 」，命名统一。
4. 每段工作/项目经历用三级标题「### 」，格式：公司/机构 - 职位（起止时间）。
5. 职责、成果、技能点一律用无序列表「- 」逐条列出，每条一个要点。
6. 关键数据、关键词用「**加粗**」。
7. 表述语气与详略贴合该样式的风格（如极简则更精炼，商务则更正式），但不得改变任何事实。`;
}

const SYSTEM_PROMPT = `你是一位资深简历排版与优化专家。用户选择了一种「简历样式模板」，你需要把用户简历的**结构**重排为该模板的规范结构，同时**完整保留**简历中的所有真实内容（姓名、联系方式、求职意向、教育背景、经历、项目、技能等），只调整结构与表达，不编造、不删除任何事实。

【排版结构规范】（以用户消息中「所选样式模板」的要求为准）
1. 姓名用一级标题「# 」。
2. 姓名之后紧跟一段文字写联系方式/求职意向。
3. 各板块用二级标题「## 」。
4. 每段工作/项目经历用三级标题「### 」。
5. 职责与成果用无序列表「- 」逐条列出。
6. 关键数据、关键词用「**加粗**」。
7. 输出只包含结构化的 Markdown，不要输出任何解释、前言、总结或代码块包裹。
8. 用简体中文输出。`;

export const Route = createFileRoute("/api/resume-style")({
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

        const body = (await request.json()) as {
          resumeId: number;
          template: string;
          content?: string;
          title?: string;
        };
        const parsed = StyleSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "参数不合法" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const resumeId = parsed.data.resumeId;

        const resume = await getResume({ data: { id: resumeId } });
        if (!resume) {
          return new Response(JSON.stringify({ error: "简历不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // 优先使用编辑器当前内容（可能未保存）；否则回退到服务端已保存内容
        const content = parsed.data.content?.trim() || resume.content || "";
        if (!content.trim()) {
          return new Response(
            JSON.stringify({ error: "简历内容为空，请先填写内容" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const title = parsed.data.title?.trim() || resume.title;
        const resumeText = htmlToText(content) || resume.plainText || content;
        const templateSpec = buildTemplateSpec(parsed.data.template);

        try {
          const text = await chat({
            adapter: deepseekAdapter(),
            systemPrompts: [SYSTEM_PROMPT],
            messages: [
              {
                role: "user",
                content: `简历标题：${title}\n\n===所选样式模板===\n${templateSpec}\n\n===用户简历全文===\n${resumeText}\n\n请按所选样式把这份简历重排为规范结构（保留全部事实），直接输出重排后的完整 Markdown。`,
              },
            ],
            stream: false,
          });

          // 去掉模型可能包裹的代码块标记
          const markdown = text
            .trim()
            .replace(/^```(?:markdown|md)?\s*/i, "")
            .replace(/```\s*$/, "")
            .trim();
          if (!markdown) {
            throw new Error("AI 未返回排版结果，请重试");
          }

          return new Response(JSON.stringify({ markdown }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : "排版失败，请稍后重试",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

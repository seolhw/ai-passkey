import { chat } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { formatSalary } from "#/lib/job";
import { listLibraryItems } from "#/lib/library-api";
import { deepseekAdapter } from "#/lib/llm";
import { getResume, listResumeTargets } from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

const OptimizeSchema = z.object({
  resumeId: z.number(),
  /** 编辑器当前内容（可能尚未保存），为空时回退到服务端已保存内容 */
  content: z.string().optional(),
  title: z.string().optional(),
});

const SYSTEM_PROMPT = `你是一位资深 AI 行业招聘顾问与简历优化专家。请对用户的简历执行「一键全文优化」：在保留全部真实经历与事实的前提下，重写文案并重新排版，让简历更专业、更有条理、更贴合目标岗位。

【内容要求】
1. 完整保留简历中所有真实信息：姓名、联系方式、教育背景、工作经历、项目经历、技能、证书等，不得编造或删除任何经历。
2. 优化表达：将平淡、啰嗦的描述改写为简洁有力、突出成果的表达；尽量量化成果（数字、比例、规模、周期），但只能基于原文已有或可合理推导的数据，严禁虚构。
3. 贴合目标岗位：若有目标 JD，突出与 JD 匹配的关键词与能力要求；若没有目标 JD，则按通用优秀简历标准优化。
4. 去芜存菁：删除空话套话与重复表述，控制总长度在 1~2 页 A4 以内。

【排版要求】（排版优化与文案优化同等重要，务必严格执行）
1. 姓名或简历标题使用一级标题「# 」。
2. 板块标题（个人简介、教育背景、工作经历、项目经历、技能特长、自我评价等）使用二级标题「## 」，各板块命名风格统一。
3. 每一段工作/项目经历使用三级标题「### 」，格式为「公司/机构 - 职位（起止时间）」；不要把条目标题写成列表项。
4. 职责、成果、技能点等内容一律用无序列表「- 」逐条列出，每条一个要点；不要写成连续大段文字。
5. 需要强调的关键数据、关键词、专有名词用「**加粗**」。
6. 板块之间空一行；可选择性用「---」分隔大板块。
7. 不使用表格、图片、任务列表等复杂格式。

【输出要求】
- 只输出优化后的完整简历 Markdown 文本，不要输出任何解释、前言、总结或代码块包裹。
- 用简体中文输出。`;

export const Route = createFileRoute("/api/resume-optimize")({
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
          content?: string;
          title?: string;
        };
        const parsed = OptimizeSchema.safeParse(body);
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
        const title = parsed.data.title?.trim() || resume.title;
        const resumeText = htmlToText(content) || resume.plainText || content;

        // 真实数据底座：简历库范本 + 目标岗位 JD（均非必需）
        const [library, targets] = await Promise.all([
          listLibraryItems(),
          listResumeTargets({ data: { resumeId } }),
        ]);
        const reference =
          library
            .slice(0, 3)
            .map((lib, i) => {
              const text = htmlToText(lib.content).slice(0, 600);
              return `【范本${i + 1}·${lib.title}】\n${text}`;
            })
            .join("\n\n") || "（暂无可参考范本）";
        const jdText = targets
          .map(
            (job, i) =>
              `【岗位${i + 1}】${job.company?.name ?? ""} - ${job.title}\n薪资：${formatSalary(job)}\n${job.jd}`,
          )
          .join("\n\n");

        try {
          const text = await chat({
            adapter: deepseekAdapter(),
            systemPrompts: [SYSTEM_PROMPT],
            messages: [
              {
                role: "user",
                content: `简历标题：${title}\n\n===真实简历库范本参考===\n${reference}\n\n===目标岗位 JD===\n${jdText || "（未选择目标岗位，请按通用优秀简历标准优化）"}\n\n===用户简历全文===\n${resumeText}\n\n请一键优化这份简历：重写文案并重新排版（标题/列表/加粗），直接输出优化后的完整 Markdown，不要输出任何其他内容。`,
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
            throw new Error("AI 未返回优化结果，请重试");
          }

          return new Response(JSON.stringify({ markdown }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : "优化失败，请稍后重试",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

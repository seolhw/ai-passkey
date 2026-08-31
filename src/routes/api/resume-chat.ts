import { chat } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { listLibraryItems } from "#/lib/library-api";
import { deepseekAdapter } from "#/lib/llm";
import { getResume, listResumeTargets } from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

const ChatSchema = z.object({
  resumeId: z.number(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .default([]),
});

const SYSTEM_PROMPT = `你是「跨界简历」的 AI 简历优化助手。用户正在编辑自己的简历。

我们有一个「真实数据底座」为你提供参考：
1. 真实简历库：来自真实通过 AI 大厂筛选的简历范本（化名处理），你可以学习它们表达成果、量化数据、命中 JD 关键词的写法。
2. 真实岗位 JD：如果用户已选择目标岗位，你会看到该岗位的真实 JD，修改应贴近 JD 的能力要求与关键词。

要求：
1. 只根据用户提供的简历与指令进行优化，不要编造用户没有的经历、技能或数据。
2. 参考简历库范本中"突出成果、量化数据、贴合 JD"的表达方式，但不要照搬其他人的经历。
3. 贴合目标岗位 JD 的关键词与能力要求；若未选目标岗位，则按通用优秀简历标准优化。
4. 如果用户要求「改写某一整块内容」，请返回改写后的完整内容；如果用户问的是建议，给出简明、可落地的几要点。
5. 输出用简体中文。
6. 不要输出解释性开场白（如「好的/可以」），直接给出对用户有用的结果。`;

/** 把简历库范本压缩成参考摘要（避免超长），最多取 3 份 */
function buildReference(resumeLibrary: { title: string; content: string }[]): string {
  const pick = resumeLibrary.slice(0, 3);
  if (pick.length === 0) return "（暂无可参考范本）";
  return pick
    .map((lib, i) => {
      const text = htmlToText(lib.content).slice(0, 600);
      return `【范本${i + 1}·${lib.title}】\n${text}`;
    })
    .join("\n\n");
}

export const Route = createFileRoute("/api/resume-chat")({
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
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        const parsed = ChatSchema.safeParse(body);
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

        const resumeText = resume.plainText || htmlToText(resume.content) || "";
        // 真实数据底座：简历库范本 + 目标岗位 JD
        const [library, targets] = await Promise.all([
          listLibraryItems(),
          listResumeTargets({ data: { resumeId } }),
        ]);
        const reference = buildReference(library);
        const jdText = targets
          .map(
            (job, i) =>
              `【岗位${i + 1}】${job.company?.name ?? ""} - ${job.title}\n${job.jd}`,
          )
          .join("\n\n");

        try {
          const text = await chat({
            adapter: deepseekAdapter(),
            systemPrompts: [SYSTEM_PROMPT],
            messages: [
              {
                role: "user",
                content: `===真实简历库范本参考===\n${reference}\n\n===目标岗位 JD===\n${jdText || "（未选择目标岗位）"}\n\n===用户简历全文===\n${resumeText}\n\n===用户与你的对话===\n${parsed.data.messages
                  .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
                  .join("\n")}\n\n请根据上述内容，参考真实范本与目标 JD，给出对用户有用的结果。`,
              },
            ],
            stream: false,
          });
          return new Response(
            JSON.stringify({
              text,
              meta: {
                libraryCount: library.length,
                jobCount: targets.length,
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "对话失败，请稍后重试",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

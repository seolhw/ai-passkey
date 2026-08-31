import { chat } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { deepseekAdapter } from "#/lib/llm";
import { getResume } from "#/lib/resume-api";
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

const SYSTEM_PROMPT = `你是「跨界简历」的 AI 简历优化助手。用户正在编辑自己的简历，你会看到用户简历的完整内容和一个对话框，用户会用自然语言提出修改需求（例如「把工作经历的语言改得更精炼」「根据目标岗位突出 AI 能力」「给自我介绍加一句量化成果」等）。

要求：
1. 只根据用户提供的简历与指令进行优化，不要编造用户没有的经历、技能或数据。
2. 如果用户要求「改写某一整块内容」，请返回改写后的完整内容；如果用户问的是建议，给出简明、可落地的几要点。
3. 输出用简体中文。
4. 不要输出解释性开场白（如「好的/可以」），直接给出对用户有用的结果。`;

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

        try {
          const text = await chat({
            adapter: deepseekAdapter(),
            systemPrompts: [SYSTEM_PROMPT],
            messages: [
              {
                role: "user",
                content: `以下是用户简历全文：\n\n${resumeText}\n\n===以下是用户与你的对话===\n${parsed.data.messages
                  .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
                  .join("\n")}\n\n请根据上述对话给出结果。`,
              },
            ],
            stream: false,
          });
          return new Response(
            JSON.stringify({ text }),
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

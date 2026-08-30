import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { geminiText } from "@tanstack/ai-gemini";
import { openaiText } from "@tanstack/ai-openai";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db/index";
import { getSessionUser } from "#/lib/session";

const SYSTEM_PROMPT = `你是一位资深 AI 行业招聘顾问，为用户提供求职咨询。你熟悉各家 AI 公司的在招岗位、薪资水平、面试要求与职业发展路径。

回答要求：
1. 基于我提供的岗位数据库回答，数据不完整时明确说明，不编造薪资与岗位。
2. 用简体中文，口语化但专业，直接给结论再给理由。
3. 可以回答的问题类型：哪些岗位薪资更高、某公司招聘偏好、转行 AI 建议、面试准备、岗位对比等。`;

export const Route = createFileRoute("/api/advisor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestSignal = request.signal;
        if (requestSignal.aborted) {
          return new Response(null, { status: 499 });
        }

        const user = await getSessionUser();
        if (!user) {
          return new Response(JSON.stringify({ error: "未登录" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const abortController = new AbortController();
        const body = (await request.json()) as {
          messages: Array<{ role: "user" | "assistant"; content: string }>;
        };
        const { messages } = body;

        // 汇总岗位库作为参考上下文
        const jobs = await db.query.jobs.findMany({
          with: { company: true },
          limit: 200,
        });
        const jobSummary = jobs
          .map(
            (j) =>
              `${j.company?.name ?? "未知公司"} · ${j.title} · 薪资：${j.salary ?? "面议"} · ${j.location ?? ""}\n${(j.jd ?? "").slice(0, 200)}`,
          )
          .join("\n\n");

        const provider = pickProvider();
        const stream = chat({
          adapter: provider.adapter,
          systemPrompts: [
            SYSTEM_PROMPT,
            `以下是当前岗位数据库（可能不完整）：\n\n${jobSummary || "（暂无岗位数据）"}`,
          ],
          messages,
          abortController,
        });

        return toServerSentEventsResponse(stream, { abortController });
      },
    },
  },
});

function pickProvider() {
  const providers = [
    {
      name: "anthropic",
      model: "claude-haiku-4-5",
      active: Boolean(process.env.ANTHROPIC_API_KEY),
      adapter: anthropicText("claude-haiku-4-5"),
    },
    {
      name: "openai",
      model: "gpt-4o",
      active: Boolean(process.env.OPENAI_API_KEY),
      adapter: openaiText("gpt-4o"),
    },
    {
      name: "gemini",
      model: "gemini-2.5-flash",
      active: Boolean(process.env.GEMINI_API_KEY),
      adapter: geminiText("gemini-2.5-flash"),
    },
  ];
  const chosen = providers.find((p) => p.active);
  if (!chosen) {
    throw new Error(
      "未配置任何 LLM API Key，请设置 ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY",
    );
  }
  return chosen;
}

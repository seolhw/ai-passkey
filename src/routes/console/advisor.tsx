import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

import { getSessionUser } from "#/lib/session";

const chatOptions = {
  connection: fetchServerSentEvents("/api/advisor"),
};

const SUGGESTIONS = [
  "哪些 AI 岗位薪资最高？",
  "零经验怎么转行大模型方向？",
  "算法岗和工程岗怎么选？",
  "最近各家公司都招什么 AI 岗位？",
];

export const Route = createFileRoute("/console/advisor")({
  component: AdvisorPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
});

/** 渲染单个消息气泡的文本内容 */
function MessageText({
  role,
  parts,
}: {
  role: "assistant" | "user";
  parts: Array<{ type: string; content?: unknown }>;
}) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type !== "text" || !part.content) return null;
        const text = String(part.content);
        if (role === "assistant") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 文本消息部分无稳定唯一 id
            <Streamdown key={index}>{text}</Streamdown>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: 文本消息部分无稳定唯一 id
        return <span key={index}>{text}</span>;
      })}
    </>
  );
}

function AdvisorPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading, stop } = useChat(chatOptions);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
  };

  // AI 正在等待首个输出（尚未开始流式回复）时显示 loading 气泡
  const last = messages[messages.length - 1];
  const isThinking = isLoading && messages.length > 0 && last?.role === "user";

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden px-4">
      {/* 主体内容：空态居中 or 对话消息区 */}
      <div className="min-h-0 flex-1 flex flex-col">
        {messages.length === 0 ? (
          /* 空状态：头部 + 引导问题 垂直居中 */
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 py-8">
            <header className="text-center">
              <p className="island-kicker mb-2 inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> 求职顾问
              </p>
              <h1 className="display-title text-3xl font-bold text-(--sea-ink)">
                问问你的 AI 求职顾问
              </h1>
              <p className="mt-3 text-sm text-(--sea-ink-soft)">
                基于真实岗位库回答，比如「哪些岗位更高薪」
              </p>
            </header>

            <div className="w-full max-w-xl">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-(--sea-ink-soft)">
                试试这些问题
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => submit(s)}
                    className="island-shell flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm text-(--sea-ink) transition hover:border-(--lagoon-deep)"
                  >
                    <span>{s}</span>
                    <MessageSquareText className="size-4 shrink-0 text-(--sea-ink-soft)" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 对话态：聊天气泡按序展示，仅在聊天区内滚动 */
          <div className="flex min-h-0 flex-1 flex-col pt-4">
            {messages
              .filter((m) => m.role !== "system")
              .map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 py-1.5 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium text-white ${
                      message.role === "assistant"
                        ? "bg-(--lagoon-deep)"
                        : "bg-(--sea-ink-soft)"
                    }`}
                  >
                    {message.role === "assistant" ? "AI" : "我"}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "assistant"
                        ? "island-shell text-(--sea-ink)"
                        : "bg-(--lagoon-deep) text-white"
                    }`}
                  >
                    <MessageText
                      role={
                        message.role === "assistant" ? "assistant" : "user"
                      }
                      parts={message.parts}
                    />
                  </div>
                </div>
              ))}

            {isThinking && (
              <div className="flex items-start gap-3 py-1.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium text-white bg-(--lagoon-deep)">
                  AI
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-(--surface-strong) px-4 py-3.5">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="ml-1 text-xs text-(--sea-ink-soft)">
                    正在思考…
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-1" />
          </div>
        )}
      </div>

      {/* 输入区固定在最底部（空态 / 对话态共用） */}
      <div className="shrink-0 border-t border-(--line) bg-(--background) py-3">
        {isLoading && messages.length > 0 && (
          <div className="mb-2 flex justify-center">
            <button
              type="button"
              onClick={stop}
              className="inline-flex h-8 items-center rounded-full border border-input px-3 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
            >
              停止生成
            </button>
          </div>
        )}
        <form
          className="island-shell flex items-center gap-2 rounded-2xl p-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            disabled={isLoading}
            placeholder="问点什么…（如：哪些岗位更高薪？）"
            className="h-10 flex-1 bg-transparent px-3 text-sm outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-(--lagoon-deep) px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
        <p className="mt-2 flex items-center justify-center gap-1 text-xs text-(--sea-ink-soft)">
          <MessageSquareText className="size-3.5" />
          回答基于当前岗位库，数据可能不完整
        </p>
      </div>
    </main>
  );
}

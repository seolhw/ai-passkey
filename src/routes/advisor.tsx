import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2, MessageSquareText, Send } from "lucide-react";
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

export const Route = createFileRoute("/advisor")({
  component: AdvisorPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
});

function AdvisorPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading, stop } = useChat(chatOptions);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col px-4 pb-6 pt-8">
      <header className="mb-6 text-center">
        <p className="island-kicker mb-1">AI 顾问</p>
        <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
          问问你的 AI 求职顾问
        </h1>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          基于真实岗位库回答，比如「哪些岗位更高薪」
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => submit(s)}
                className="island-shell rounded-xl px-4 py-3 text-left text-sm text-(--sea-ink) transition hover:border-(--lagoon-deep)"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "assistant" ? "" : "flex-row-reverse"
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
                {message.parts.map((part, index) =>
                  part.type === "text" && part.content ? (
                    <Streamdown
                      // biome-ignore lint/suspicious/noArrayIndexKey: text 消息部分无稳定唯一 id
                      key={index}
                    >
                      {part.content}
                    </Streamdown>
                  ) : null,
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-4 mt-4">
        {isLoading && (
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

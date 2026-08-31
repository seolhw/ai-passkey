import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Copy,
  ExternalLink,
  Mail,
  MailCheck,
  MessageSquareHeart,
  PenLine,
  Handshake,
} from "lucide-react";
import { useState } from "react";

import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/contact")({
  component: ContactPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
});

const EMAIL = "seolhw@qq.com";
const BLOG_URL = "https://huiwang.fun";

const TOPICS = [
  {
    icon: PenLine,
    title: "勘错",
    desc: "页面里发现错别字、岗位信息有误，告诉我帮你修正。",
  },
  {
    icon: MessageSquareHeart,
    title: "建议",
    desc: "对某个功能有更好想法，或希望新增某个能力，欢迎提。",
  },
  {
    icon: MailCheck,
    title: "反馈",
    desc: "使用中遇到 Bug、体验卡顿，反馈给我来定位和修复。",
  },
  {
    icon: Handshake,
    title: "合作",
    desc: "招聘渠道、数据合作、商业合作等，都欢迎聊聊。",
  },
] as const;

function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 剪贴板不可用时忽略
    }
  };

  return (
    <main className="page-wrap px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <p className="island-kicker mb-1">联系开发者</p>
        <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
          和我聊聊
        </h1>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          一个独立开发者维护的 AI 简历工作台，欢迎勘错、建议、反馈与合作
        </p>
      </header>

      {/* 联系卡片 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 邮箱 */}
        <article className="feature-card p-6">
          <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground)">
            <Mail className="size-5" />
          </span>
          <h2 className="mb-1 text-base font-semibold text-(--sea-ink)">
            开发者邮箱
          </h2>
          <p className="mb-4 text-sm text-(--sea-ink-soft)">
            关于这个产品的一切，都可以发到邮箱
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-(--lagoon-deep) px-4 text-sm font-medium text-white no-underline transition hover:opacity-90"
            >
              <Mail className="size-4" /> {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium text-(--sea-ink) transition hover:bg-accent ${
                copied ? "border-(--lagoon-deep) text-(--lagoon-deep)" : "border-input"
              }`}
            >
              {copied ? (
                <>
                  <MailCheck className="size-4" /> 已复制
                </>
              ) : (
                <>
                  <Copy className="size-4" /> 复制
                </>
              )}
            </button>
          </div>
        </article>

        {/* Blog */}
        <article className="feature-card p-6">
          <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground)">
            <PenLine className="size-5" />
          </span>
          <h2 className="mb-1 text-base font-semibold text-(--sea-ink)">
            开发者 Blog
          </h2>
          <p className="mb-4 text-sm text-(--sea-ink-soft)">
            产品背后的思考、开发过程与技术文章
          </p>
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-input px-4 text-sm font-medium text-(--sea-ink) no-underline transition hover:bg-accent"
          >
            {BLOG_URL} <ExternalLink className="size-4" />
          </a>
        </article>
      </div>

      {/* 联系主题 */}
      <section className="mt-10">
        <h2 className="mb-4 text-base font-semibold text-(--sea-ink)">
          可以找我聊这些
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((topic) => (
            <article key={topic.title} className="feature-card p-5">
              <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground)">
                <topic.icon className="size-4" />
              </span>
              <h3 className="mb-1 text-sm font-semibold text-(--sea-ink)">
                {topic.title}
              </h3>
              <p className="m-0 text-xs leading-relaxed text-(--sea-ink-soft)">
                {topic.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-(--sea-ink-soft)">
        通常会在 1-2 个工作日内回复。如果是急事，可以在邮件标题注明「急」。
      </p>
    </main>
  );
}

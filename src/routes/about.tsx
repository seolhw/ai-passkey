import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Layers,
  MessagesSquare,
  Sparkles,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

const PILLARS = [
  {
    icon: Sparkles,
    title: "JD 驱动的润色",
    desc: "AI 不产出通用套话，而是读取目标岗位的完整 JD，逐条给出原文与建议改法的对照。",
  },
  {
    icon: Target,
    title: "真实岗位库",
    desc: "持续抓取字节、OpenAI、Anthropic、DeepSeek 等 AI 公司在招岗位，供你锁定目标。",
  },
  {
    icon: Layers,
    title: "版本管理",
    desc: "每一次修改都是独立版本，可写说明、可回滚，大胆尝试不同写法。",
  },
  {
    icon: MessagesSquare,
    title: "求职顾问",
    desc: "基于岗位库的 AI 问答，帮你理解薪资行情、选择方向、规划转行路径。",
  },
];

function About() {
  return (
    <main className="page-wrap px-4 py-14">
      <section className="max-w-3xl">
        <p className="island-kicker mb-4">关于跨界简历</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          为 AI 求职者打造的简历工作台
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          「跨界简历」服务一个具体的场景：想进字节、OpenAI、Anthropic、DeepSeek
          等 AI 公司的求职者，认真花上几个小时打磨一份能通过 ATS
          与面试官双重筛选的简历。
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          我们的做法很朴素：上传简历 → 选择目标岗位 → AI 读取真实 JD 逐条打磨 →
          版本管理随时回滚。整个过程可解释、可审查、可回退——你不必盲信 AI。
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <article key={pillar.title} className="feature-card p-6">
            <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
              <pillar.icon className="size-4.5" />
            </span>
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {pillar.title}
            </h2>
            <p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {pillar.desc}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <Link
          to="/resumes/new"
          className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold no-underline"
        >
          现在就开始
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}

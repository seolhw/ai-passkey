import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Compass,
  FileUp,
  Layers,
  MessagesSquare,
  ScanSearch,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";
import { AI_COMPANIES } from "@/constants/models";
import GithubIcon from "../components/GithubIcon";
import LogoAvatar from "../components/LogoAvatar";

export const Route = createFileRoute("/")({ component: LandingPage });

const STEPS = [
  {
    icon: FileUp,
    title: "上传简历",
    desc: "支持 PDF / Word / TXT，自动解析为可编辑内容，无需手动排版。",
  },
  {
    icon: Target,
    title: "锁定目标岗位",
    desc: "从岗位库选择目标公司与岗位，AI 读取真实 JD，而不是泛泛而谈。",
  },
  {
    icon: Wand2,
    title: "AI 修改 · 版本管理",
    desc: "逐条给出「原文 → 建议改法」，一键应用并生成新版本，随时可回滚。",
  },
];

const FEATURES = [
  {
    icon: ScanSearch,
    title: "简历智能匹配岗位",
    desc: "AI 解析你的技能与经历，从岗位库中智能推荐最合适的目标岗位，每一份简历都投其所好。",
  },
  {
    icon: Sparkles,
    title: "JD 精准修改",
    desc: "把岗位 JD 注入提示词，针对关键词命中逐句打磨，而不是通用套话。",
  },
  {
    icon: Layers,
    title: "版本管理",
    desc: "每次修改生成独立版本、可写说明，回滚零成本，放心大胆改。",
  },
  {
    icon: Briefcase,
    title: "AI 公司岗位库",
    desc: `汇聚 ${AI_COMPANIES.slice(0, 3)
      .map((c) => c.name)
      .join("、")} 等十多家顶尖 AI 公司在招岗位与完整 JD。`,
  },
  {
    icon: MessagesSquare,
    title: "AI 求职顾问",
    desc: "基于真实岗位库问答：薪资行情、方向选择、转行路径。",
  },
  {
    icon: Compass,
    title: "能力风向标",
    desc: "提醒你当下 AI 公司更看重哪些核心能力，优先补齐最值钱的短板，不盲目学习。",
  },
];

function LandingPage() {
  return (
    <main className="page-wrap px-4 pb-20">
      {/* Hero */}
      <section className="relative px-1 pb-20 pt-16 sm:pt-24 lg:pt-28 lg:pb-24">
        <div className="relative mb-5 flex items-center gap-3">
          <span className="island-kicker">跨界简历 · AI 求职工作台</span>
          <a
            href="https://github.com/seolhw/ai-passkey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--surface-strong) px-3 py-1 text-xs font-medium text-(--sea-ink-soft) no-underline transition hover:border-(--lagoon-deep) hover:text-(--sea-ink)"
          >
            <GithubIcon className="size-3.5" />
            开源
          </a>
        </div>
        <h1 className="display-title relative  text-4xl font-bold leading-[1.1] tracking-tight text-(--sea-ink) sm:text-6xl  lg:text-7xl lg:leading-[1.05]">
          上传简历，选择岗位，
          <span className="btn-gradient-text">按目标岗位逐条修改简历</span>
        </h1>
        <p className="relative mt-6  text-base leading-relaxed text-(--sea-ink-soft) sm:text-lg">
          {"面向国内 "}
          {AI_COMPANIES.map((company, index) => (
            <span
              key={company.name}
              className="inline-flex items-center gap-1.5"
            >
              <LogoAvatar
                icon={company.logo}
                name={company.name}
                className="size-6"
              />
              <span className="btn-gradient-text font-semibold text-[1.3rem]">
                {company.name}
              </span>
              {index < AI_COMPANIES.length - 1 ? "、" : ""}
            </span>
          ))}
          {
            " 等十几家顶尖 AI 公司求职者的简历工作台。AI 读取真实岗位 JD，逐条给出符合所选岗位的「原文 → 建议改法」，接受即生成可回滚的新版本。"
          }
        </p>

        <div className="relative mt-9 flex flex-wrap gap-3">
          <Link
            to="/console"
            className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold no-underline"
          >
            开始修改简历
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/console/companies"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-(--line) bg-(--surface-strong) px-6 text-sm font-medium text-(--sea-ink) no-underline transition hover:border-(--lagoon-deep)"
          >
            浏览招聘简章
          </Link>
        </div>
        <p className="relative mt-5 flex flex-wrap items-center gap-x-2 text-lg font-bold text-(--sea-ink)">
          <Zap className="size-5 text-(--lagoon-deep)" />
          <span className="btn-gradient-text">
            认真花上30分钟，换一份能进AI大厂的简历
          </span>
        </p>
      </section>

      {/* 三步工作流 */}
      <section className="py-10">
        <p className="island-kicker mb-8 text-center">三步工作流</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="feature-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground)">
                  <step.icon className="size-4.5" />
                </span>
                <span className="text-xs font-bold text-(--sea-ink-soft)">
                  STEP {index + 1}
                </span>
              </div>
              <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
                {step.title}
              </h2>
              <p className="m-0 text-sm leading-relaxed text-(--sea-ink-soft)">
                {step.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="py-10">
        <p className="island-kicker mb-8 text-center">功能亮点</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card p-6">
              <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground)">
                <feature.icon className="size-4.5" />
              </span>
              <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
                {feature.title}
              </h2>
              <p className="m-0 text-sm leading-relaxed text-(--sea-ink-soft)">
                {feature.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="btn-gradient relative mt-10 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-10">
        <h2 className="display-title text-2xl font-bold text-white sm:text-3xl">
          认真花上30分钟，换一份能进AI大厂的简历
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85">
          上传你的现有简历，选出目标岗位，AI 约 30
          分钟完成一轮逐条打磨，每一步都可回滚。
        </p>
        <Link
          to="/console/resumes/new"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-7 text-sm font-semibold text-(--ai-violet) no-underline transition hover:opacity-90"
        >
          上传简历，立即开始
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}

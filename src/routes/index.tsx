import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Briefcase,
	FileUp,
	Layers,
	MessagesSquare,
	Sparkles,
	Target,
	Wand2,
} from "lucide-react";

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
		title: "AI 润色 · 版本管理",
		desc: "逐条给出「原文 → 建议改法」，一键应用并生成新版本，随时可回滚。",
	},
];

const FEATURES = [
	{
		icon: Sparkles,
		title: "JD 精准润色",
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
		desc: "汇聚字节、OpenAI、Anthropic、DeepSeek 等在招岗位与完整 JD。",
	},
	{
		icon: MessagesSquare,
		title: "AI 求职顾问",
		desc: "基于真实岗位库问答：薪资行情、方向选择、转行路径。",
	},
];

function LandingPage() {
	return (
		<main className="page-wrap px-4 pb-20">
			{/* Hero */}
			<section className="relative overflow-hidden px-1 pb-20 pt-16 sm:pt-24">
				<div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,var(--hero-b),transparent_66%)]" />
				<div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,var(--hero-a),transparent_66%)]" />

				<p className="island-kicker relative mb-5">跨界简历 · AI 求职工作台</p>
				<h1 className="display-title relative max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-[var(--sea-ink)] sm:text-6xl">
					上传简历，AI 按目标岗位
					<span className="btn-gradient-text">逐条打磨</span>
				</h1>
				<p className="relative mt-6 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
					面向字节、OpenAI、Anthropic、DeepSeek 等 AI 公司求职者。AI
					读取真实岗位 JD，逐条给出「原文 →
					建议改法」，接受即生成可回滚的新版本。
				</p>
				<div className="relative mt-9 flex flex-wrap gap-3">
					<Link
						to="/resumes/new"
						className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold no-underline"
					>
						免费开始润色
						<ArrowRight className="size-4" />
					</Link>
					<Link
						to="/companies"
						className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-6 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:border-[var(--lagoon-deep)]"
					>
						浏览招聘简章
					</Link>
				</div>
				<p className="relative mt-4 text-xs text-[var(--sea-ink-soft)]">
					认真操作数小时的求职工作流，不靠运气靠匹配度。
				</p>
			</section>

			{/* 三步工作流 */}
			<section className="py-10">
				<p className="island-kicker mb-8 text-center">三步工作流</p>
				<div className="grid gap-4 sm:grid-cols-3">
					{STEPS.map((step, index) => (
						<article key={step.title} className="feature-card p-6">
							<div className="mb-4 flex items-center gap-3">
								<span className="flex size-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
									<step.icon className="size-4.5" />
								</span>
								<span className="text-xs font-bold text-[var(--sea-ink-soft)]">
									STEP {index + 1}
								</span>
							</div>
							<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
								{step.title}
							</h2>
							<p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
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
							<span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
								<feature.icon className="size-4.5" />
							</span>
							<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
								{feature.title}
							</h2>
							<p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
								{feature.desc}
							</p>
						</article>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="btn-gradient relative mt-10 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-10">
				<h2 className="display-title text-2xl font-bold text-white sm:text-3xl">
					认真花上几小时，换一份能进大厂的简历
				</h2>
				<p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85">
					上传你的现有简历，选出目标岗位，剩下交给 AI 逐条打磨——每一步都可回滚。
				</p>
				<Link
					to="/resumes/new"
					className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-7 text-sm font-semibold text-[var(--ai-violet)] no-underline transition hover:opacity-90"
				>
					上传简历，立即开始
					<ArrowRight className="size-4" />
				</Link>
			</section>
		</main>
	);
}

import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { createJob } from "#/lib/company-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/companies/new")({
	component: NewJobPage,
	beforeLoad: async () => {
		const user = await getSessionUser();
		if (!user) throw redirect({ to: "/login" });
	},
});

function NewJobPage() {
	const router = useRouter();
	const [companyName, setCompanyName] = useState("");
	const [title, setTitle] = useState("");
	const [salary, setSalary] = useState("");
	const [location, setLocation] = useState("");
	const [jd, setJd] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		if (!companyName.trim() || !title.trim() || !jd.trim()) {
			setError("公司名、岗位名称和 JD 内容为必填");
			return;
		}
		setError("");
		setSaving(true);
		const job = await createJob({
			data: {
				companyName: companyName.trim(),
				title: title.trim(),
				jd: jd.trim(),
				salary: salary.trim() || undefined,
				location: location.trim() || undefined,
				sourceUrl: sourceUrl.trim() || undefined,
			},
		});
		setSaving(false);
		if (!job) {
			setError("保存失败，请重试");
			return;
		}
		await router.navigate({ to: "/companies" });
	};

	return (
		<main className="page-wrap max-w-2xl px-4 pb-16 pt-10">
			<header className="mb-6">
				<Link
					to="/companies"
					className="mb-4 inline-flex h-9 items-center gap-1 rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
				>
					<ArrowLeft className="size-4" /> 返回
				</Link>
				<p className="island-kicker mb-1">招聘简章</p>
				<h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
					手动添加岗位
				</h1>
				<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
					添加自己关注的岗位 JD，之后可在目标岗位选择中使用
				</p>
			</header>

			<form
				className="island-shell grid gap-4 rounded-2xl p-5"
				onSubmit={(e) => {
					e.preventDefault();
					void handleSubmit();
				}}
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
						公司名 *
						<input
							value={companyName}
							onChange={(e) => setCompanyName(e.target.value)}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
							placeholder="如：OpenAI"
						/>
					</label>
					<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
						岗位名称 *
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
							placeholder="如：AI 产品经理"
						/>
					</label>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
						薪资
						<input
							value={salary}
							onChange={(e) => setSalary(e.target.value)}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
							placeholder="如：30-50K·16薪"
						/>
					</label>
					<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
						地点
						<input
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
							placeholder="如：北京 / 远程"
						/>
					</label>
				</div>

				<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
					JD 内容 *
					<textarea
						value={jd}
						onChange={(e) => setJd(e.target.value)}
						rows={10}
						className="rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
						placeholder={"岗位职责…\n任职要求…\n加分项…"}
					/>
				</label>

				<label className="grid gap-1.5 text-sm font-medium text-[var(--sea-ink)]">
					来源链接
					<input
						value={sourceUrl}
						onChange={(e) => setSourceUrl(e.target.value)}
						className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
						placeholder="https://…（可选）"
					/>
				</label>

				{error && (
					<p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-500/10">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={saving}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--lagoon-deep)] px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
				>
					{saving ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Plus className="size-4" />
					)}
					保存岗位
				</button>
			</form>
		</main>
	);
}

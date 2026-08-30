import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Copy, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { copyLibraryToResume, listLibraryItems } from "#/lib/library-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/library/")({
	component: LibraryPage,
	beforeLoad: async () => {
		const user = await getSessionUser();
		if (!user) throw redirect({ to: "/login" });
	},
	loader: async () => {
		const items = await listLibraryItems();
		return { items };
	},
});

type LibraryItem = {
	id: number;
	title: string;
	industry: string | null;
	tags: string | null;
	content: string;
	featured: boolean;
};

function LibraryPage() {
	const { items } = Route.useLoaderData();
	const router = useRouter();
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [copyingId, setCopyingId] = useState<number | null>(null);

	const handleCopy = async (item: LibraryItem) => {
		setCopyingId(item.id);
		const resume = await copyLibraryToResume({ data: { id: item.id } });
		setCopyingId(null);
		if (!resume) return;
		await router.navigate({
			to: "/resumes/$resumeId",
			params: { resumeId: String(resume.id) },
		});
	};

	const tagList = (item: LibraryItem) =>
		(item.tags ?? "")
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

	return (
		<main className="page-wrap px-4 pb-16 pt-10">
			<header className="mb-8">
				<p className="island-kicker mb-1">简历大厅</p>
				<h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
					优质简历参考
				</h1>
				<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
					精选通过 AI 大厂筛选的简历范本，一键复制到编辑器再个性化修改
				</p>
			</header>

			{items.length === 0 ? (
				<section className="island-shell rounded-2xl px-6 py-14 text-center">
					<Sparkles className="mx-auto mb-3 size-10 text-[var(--sea-ink-soft)]" />
					<p className="text-sm text-[var(--sea-ink-soft)]">
						大厅暂无简历，请先运行种子数据或等待内容更新
					</p>
				</section>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => {
						const isOpen = expandedId === item.id;
						return (
							<section
								key={item.id}
								className={`island-shell rounded-2xl p-5 transition ${
									item.featured ? "border-[var(--lagoon-deep)]" : ""
								}`}
							>
								<div className="mb-3 flex items-start justify-between gap-2">
									<div className="min-w-0">
										<h2 className="truncate text-sm font-semibold text-[var(--sea-ink)]">
											{item.title}
										</h2>
										<p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
											{item.industry || "通用"}
										</p>
									</div>
									{item.featured && (
										<span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[var(--lagoon-deep)]/10 px-2 text-[11px] font-medium text-[var(--lagoon-deep)]">
											精选
										</span>
									)}
								</div>

								{tagList(item).length > 0 && (
									<div className="mb-4 flex flex-wrap gap-1.5">
										{tagList(item).map((tag) => (
											<span
												key={tag}
												className="rounded-full bg-[var(--chip-bg)] px-2 py-0.5 text-[11px] text-[var(--sea-ink-soft)]"
											>
												{tag}
											</span>
										))}
									</div>
								)}

								{isOpen && (
									<div className="mb-4 max-h-80 overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
										<div
											className="resume-editor-content text-sm leading-relaxed text-[var(--sea-ink)]"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染已消毒的简历 HTML 内容
											dangerouslySetInnerHTML={{ __html: item.content }}
										/>
									</div>
								)}

								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => setExpandedId(isOpen ? null : item.id)}
										className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
									>
										{isOpen ? (
											<>
												<EyeOff className="size-3.5" /> 收起
											</>
										) : (
											<>
												<Eye className="size-3.5" /> 预览
											</>
										)}
									</button>
									<button
										type="button"
										onClick={() => void handleCopy(item)}
										disabled={copyingId === item.id}
										className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--lagoon-deep)] px-3 text-xs font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
									>
										{copyingId === item.id ? (
											<Loader2 className="size-3.5 animate-spin" />
										) : (
											<Copy className="size-3.5" />
										)}
										复制到编辑器
									</button>
								</div>
							</section>
						);
					})}
				</div>
			)}
		</main>
	);
}

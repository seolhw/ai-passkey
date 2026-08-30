import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useState } from "react";

import { getResume, listResumeTargets, saveResume } from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/resumes/$resumeId/polish")({
  component: PolishPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
  loader: async ({ params }) => {
    const resume = await getResume({ data: { id: Number(params.resumeId) } });
    if (!resume) throw redirect({ to: "/resumes" });
    const targets = await listResumeTargets({ data: { resumeId: resume.id } });
    return { resume, targets };
  },
});

type Suggestion = {
  section: string;
  original: string;
  replacement: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
};

type Weakness = {
  area: string;
  detail: string;
  advice: string;
};

type PolishResult = {
  summary: string;
  suggestions: Suggestion[];
  weaknesses: Weakness[];
};

function PolishPage() {
  const { resume, targets } = Route.useLoaderData();
  const router = useRouter();
  const [result, setResult] = useState<PolishResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<Set<number>>(() => new Set());
  const [rejected, setRejected] = useState<Set<number>>(() => new Set());
  const [applying, setApplying] = useState(false);

  const canRun = targets.length > 0;

  const handlePolish = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAccepted(new Set());
    setRejected(new Set());
    const res = await fetch("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: resume.id }),
    });
    const data = (await res.json()) as PolishResult & { error?: string };
    if (!res.ok) {
      setError(data.error || "润色失败");
      setLoading(false);
      return;
    }
    setResult(data);
    setLoading(false);
  };

  const pendingCount = result
    ? result.suggestions.filter((_, i) => !accepted.has(i) && !rejected.has(i))
        .length
    : 0;

  const acceptAll = () => {
    if (!result) return;
    setAccepted(new Set(result.suggestions.map((_, i) => i)));
  };

  const rejectAll = () => {
    if (!result) return;
    setRejected(new Set(result.suggestions.map((_, i) => i)));
  };

  const applyAccepted = async () => {
    if (!result) return;
    setApplying(true);
    setError("");
    let html = resume.content;
    // 已接受的建议按 original 精确替换
    result.suggestions.forEach((s, i) => {
      if (!accepted.has(i)) return;
      if (s.original.trim() && html.includes(s.original)) {
        html = html.replace(s.original, s.replacement);
      }
    });
    // 若 HTML 替换不完整，回退到纯文本替换
    const currentText = htmlToText(html);
    const fixed = await saveResume({
      data: {
        id: resume.id,
        title: resume.title,
        content: html,
        plainText: currentText,
        note: `应用 AI 润色（${accepted.size} 条建议）`,
      },
    });
    if (fixed) {
      await router.invalidate();
      await router.navigate({
        to: "/resumes/$resumeId",
        params: { resumeId: String(resume.id) },
      });
    } else {
      setError("应用失败，请重新登录后重试");
      setApplying(false);
    }
  };

  const difficultyColor = {
    easy: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    medium: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    hard: "text-red-600 bg-red-50 dark:bg-red-950/40",
  };

  const difficultyLabel = { easy: "简单", medium: "中等", hard: "较难" };

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          to="/resumes/$resumeId"
          params={{ resumeId: String(resume.id) }}
          className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
        >
          返回编辑器
        </Link>
        <div className="min-w-0 flex-1">
          <p className="island-kicker mb-1">AI 润色</p>
          <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
            简历润色：{resume.title}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void handlePolish()}
          disabled={loading || !canRun}
          className="btn-gradient inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "AI 润色中…" : result ? "重新润色" : "开始润色"}
        </button>
      </header>

      {!canRun && (
        <section className="island-shell mb-6 flex items-center gap-3 rounded-2xl p-4">
          <AlertTriangle className="size-5 text-amber-500" />
          <p className="text-sm text-(--sea-ink-soft)">
            尚未选择目标岗位，润色将缺少精准方向。
          </p>
          <Link
            to="/resumes/$resumeId/targets"
            params={{ resumeId: String(resume.id) }}
            className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <BookOpen className="size-3.5" />
            去选择岗位
          </Link>
        </section>
      )}

      {targets.length > 0 && !loading && !result && !error && (
        <section className="island-shell rounded-2xl p-4">
          <h3 className="mb-2 text-sm font-semibold text-(--sea-ink)">
            本次润色将参考以下目标岗位 JD
          </h3>
          <div className="flex flex-wrap gap-2">
            {targets.map((job) => (
              <span
                key={job.id}
                className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1 text-xs text-(--sea-ink)"
              >
                {job.company?.name ?? ""} · {job.title}
              </span>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          {error}
        </div>
      )}

      {loading && (
        <section className="island-shell rounded-2xl px-6 py-16 text-center">
          <Loader2 className="mx-auto mb-4 size-10 animate-spin text-(--lagoon-deep)" />
          <h2 className="mb-1 text-lg font-semibold text-(--sea-ink)">
            AI 正在分析简历与目标 JD…
          </h2>
          <p className="text-sm text-(--sea-ink-soft)">
            逐条生成修改建议与知识薄弱点，可能需要 30 秒左右
          </p>
        </section>
      )}

      {result && !loading && (
        <div className="grid gap-6">
          {/* 总览 */}
          <section className="island-shell rounded-2xl p-5">
            <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
              整体修改思路
            </h2>
            <p className="text-sm leading-relaxed text-(--sea-ink-soft)">
              {result.summary}
            </p>
          </section>

          {/* 修改建议 */}
          <section className="island-shell rounded-2xl p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-(--sea-ink)">
                修改建议（{result.suggestions.length} 条）
              </h2>
              <span className="text-xs text-(--sea-ink-soft)">
                已接受 {accepted.size} · 已拒绝 {rejected.size} · 待处理{" "}
                {pendingCount}
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
                >
                  <Check className="size-3.5" />
                  全部接受
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
                >
                  <X className="size-3.5" />
                  全部拒绝
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {result.suggestions.map((s, i) => {
                const isAccepted = accepted.has(i);
                const isRejected = rejected.has(i);
                return (
                  <article
                    // biome-ignore lint/suspicious/noArrayIndexKey: 建议项无稳定唯一 id
                    key={i}
                    className={`rounded-xl border p-4 transition ${
                      isAccepted
                        ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30"
                        : isRejected
                          ? "border-(--line) bg-(--surface) opacity-60"
                          : "border-(--line) bg-(--surface)"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-(--chip-bg) px-2.5 py-0.5 text-xs font-medium text-(--sea-ink)">
                        {s.section}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[s.difficulty]}`}
                      >
                        {difficultyLabel[s.difficulty]}
                      </span>
                      {isAccepted && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                          已接受
                        </span>
                      )}
                      {isRejected && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          已忽略
                        </span>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-medium text-red-500">
                          原文
                        </p>
                        <p className="rounded-lg border border-(--line) bg-white/60 p-2.5 text-sm leading-relaxed text-(--sea-ink-soft) line-through decoration-red-300 dark:bg-black/20">
                          {s.original}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-emerald-600">
                          建议改为
                        </p>
                        <p className="rounded-lg border border-emerald-200 bg-white/60 p-2.5 text-sm leading-relaxed text-(--sea-ink) dark:border-emerald-900 dark:bg-black/20">
                          {s.replacement}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-(--sea-ink-soft)">
                      <span className="font-medium text-(--sea-ink)">
                        理由：{" "}
                      </span>
                      {s.reason}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = new Set(accepted);
                          const rej = new Set(rejected);
                          if (isAccepted) next.delete(i);
                          else {
                            next.add(i);
                            rej.delete(i);
                          }
                          setAccepted(next);
                          setRejected(rej);
                        }}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition ${
                          isAccepted
                            ? "bg-emerald-500 text-white"
                            : "border border-input text-(--sea-ink-soft) hover:bg-accent"
                        }`}
                      >
                        <Check className="size-3.5" />
                        接受
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const rej = new Set(rejected);
                          const acc = new Set(accepted);
                          if (isRejected) rej.delete(i);
                          else {
                            rej.add(i);
                            acc.delete(i);
                          }
                          setRejected(rej);
                          setAccepted(acc);
                        }}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition ${
                          isRejected
                            ? "bg-neutral-400 text-white"
                            : "border border-input text-(--sea-ink-soft) hover:bg-accent"
                        }`}
                      >
                        <X className="size-3.5" />
                        忽略
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void applyAccepted()}
              disabled={applying || accepted.size === 0}
              className="mt-6 inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              应用 {accepted.size} 条修改（生成新版本，可回滚）
            </button>
          </section>

          {/* 知识薄弱点 */}
          <section className="island-shell rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-(--sea-ink)">
              <AlertTriangle className="size-4 text-amber-500" />
              知识薄弱点（面试前重点准备）
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.weaknesses.map((w, i) => (
                <article
                  // biome-ignore lint/suspicious/noArrayIndexKey: 薄弱点无稳定唯一 id
                  key={i}
                  className="rounded-xl border border-(--line) bg-(--surface) p-4"
                >
                  <h3 className="mb-1 text-sm font-semibold text-(--sea-ink)">
                    {w.area}
                  </h3>
                  <p className="mb-2 text-xs leading-relaxed text-(--sea-ink-soft)">
                    {w.detail}
                  </p>
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium text-(--lagoon-deep)">
                      建议：{" "}
                    </span>
                    <span className="text-(--sea-ink-soft)">{w.advice}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>

          <p className="flex items-center justify-center gap-1.5 text-xs text-(--sea-ink-soft)">
            <RotateCcw className="size-3" />
            所有应用均生成新版本，可在编辑器「版本历史」中随时回滚
          </p>
        </div>
      )}
    </main>
  );
}

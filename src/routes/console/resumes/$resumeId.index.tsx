import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  History,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Streamdown } from "streamdown";

import ConfirmDialog from "#/components/ConfirmDialog";
import ResumeEditor, {
  type ResumeEditorHandle,
} from "#/components/resume/ResumeEditor";
import TemplatePreview from "#/components/resume/TemplatePreview";
import {
  DEFAULT_RESUME_TEMPLATE,
  getResumeTemplate,
  RESUME_TEMPLATES,
} from "#/constants/resume-templates";
import { listCompanies, listJobs } from "#/lib/company-api";
import {
  getResume,
  listResumeTargets,
  listVersions,
  rollbackVersion,
  saveResume,
  setResumeTargets,
} from "#/lib/resume-api";
import { htmlToText, textToHtml } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/resumes/$resumeId/")({
  component: ResumeDetailPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async ({ params }) => {
    const resume = await getResume({ data: { id: Number(params.resumeId) } });
    if (!resume) throw redirect({ to: "/console/resumes" });
    const versions = await listVersions({ data: { id: resume.id } });
    const [jobs, selected, companies] = await Promise.all([
      listJobs(),
      listResumeTargets({ data: { resumeId: resume.id } }),
      listCompanies(),
    ]);
    return { resume, versions, jobs, selected, companies };
  },
});

type ChatMsg = { role: "user" | "assistant"; content: string; id: string };

function ResumeDetailPage() {
  const { resume, versions, jobs, selected, companies } = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState(resume.title);
  const [html, setHtml] = useState(resume.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [rollbacking, setRollbacking] = useState<number | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);
  const [error, setError] = useState("");

  // 右侧栏折叠状态：历史版本默认展开，AI 修改默认展开
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  // AI 修改（聊天）
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  // 目标岗位（内嵌折叠，默认关闭）
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [targetIds, setTargetIds] = useState<Set<number>>(() => new Set());
  const [targetsModalOpen, setTargetsModalOpen] = useState(false);
  const [targetsSaving, setTargetsSaving] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  // 一键 AI 优化
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const editorRef = useRef<ResumeEditorHandle>(null);
  const [template, setTemplate] = useState(
    resume.template || DEFAULT_RESUME_TEMPLATE,
  );
  const [styling, setStyling] = useState(false);
  const [styled, setStyled] = useState(false);

  const pending = useRef(false);

  useEffect(() => {
    setTitle(resume.title);
    setHtml(resume.content);
    setTargetIds(new Set(selected.map((j) => j.id)));
    setTemplate(resume.template || DEFAULT_RESUME_TEMPLATE);
  }, [resume, selected]);

  useEffect(() => {
    if (chatMessages.length === 0) return;
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const plainText = useMemo(() => htmlToText(html), [html]);

  // 是否有未保存的改动（对比最近一次已持久化的内容）
  const dirty =
    html !== resume.content ||
    title !== resume.title ||
    template !== (resume.template ?? DEFAULT_RESUME_TEMPLATE);

  // 目标岗位：按公司分组
  const targetGroups = useMemo(() => {
    const map = new Map<string, typeof jobs>();
    jobs.forEach((job) => {
      const name = job.company?.name ?? "未知公司";
      const arr = map.get(name) ?? [];
      arr.push(job);
      map.set(name, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [jobs]);

  // 弹窗内：按公司名 + 岗位名 + 城市过滤后的扁平列表
  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return jobs;
    const q = jobSearch.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        (job.company?.name ?? "").toLowerCase().includes(q) ||
        job.jobCities?.some((cn) => cn.city.toLowerCase().includes(q)),
    );
  }, [jobs, jobSearch]);

  // 热门公司：岗位数最多的前 3 家
  const hotGroups = useMemo(() => targetGroups.slice(0, 3), [targetGroups]);

  const toggleTarget = (jobId: number) => {
    const next = new Set(targetIds);
    if (next.has(jobId)) next.delete(jobId);
    else next.add(jobId);
    setTargetIds(next);
  };

  const saveTargets = async () => {
    setTargetsSaving(true);
    await setResumeTargets({
      data: { resumeId: resume.id, jobIds: Array.from(targetIds) },
    });
    setTargetsSaving(false);
    setTargetsModalOpen(false);
  };

  const handleSave = async () => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    const result = await saveResume({
      data: {
        id: resume.id,
        title,
        content: html,
        plainText,
        template,
        note: note || undefined,
      },
    });
    if (result) {
      setSaved(true);
      setNote("");
      setTimeout(() => setSaved(false), 2000);
      await router.invalidate();
    } else {
      setError("保存失败，请重新登录后重试");
    }
    pending.current = false;
    setSaving(false);
  };

  /** 一键 AI 优化：重写文案并重新排版（标题/列表/加粗），直接应用到编辑器（未保存，可检查后再保存） */
  const handleOptimize = async () => {
    if (optimizing) return;
    setOptimizing(true);
    setError("");
    setOptimized(false);
    try {
      const res = await fetch("/api/resume-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, title, content: html }),
      });
      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || !data.markdown) {
        setError(data.error || "AI 优化失败，请重试");
        return;
      }
      editorRef.current?.applyMarkdown(data.markdown);
      setOptimized(true);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setOptimizing(false);
    }
  };

  /** 按所选样式让 AI 重排简历结构（保留全部事实内容） */
  const handleApplyStyle = async () => {
    if (styling) return;
    setStyling(true);
    setError("");
    setStyled(false);
    try {
      const res = await fetch("/api/resume-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          template,
          title,
          content: html,
        }),
      });
      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || !data.markdown) {
        setError(data.error || "AI 排版失败，请重试");
        return;
      }
      editorRef.current?.applyMarkdown(data.markdown);
      setStyled(true);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setStyling(false);
    }
  };

  const handleRollback = async (versionId: number) => {
    setRollbacking(versionId);
    setRollbackTarget(null);
    setError("");
    await rollbackVersion({ data: { resumeId: resume.id, versionId } });
    setRollbacking(null);
    await router.invalidate();
  };

  const handleDownloadDocx = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, LevelFormat } =
      await import("docx");
    const children = htmlToDocxParagraphs(html, {
      Paragraph,
      TextRun,
      HeadingLevel,
    });
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "ordered-list",
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: "%1.",
                alignment: "start",
                style: { paragraph: { indent: { left: 360, hanging: 260 } } },
              },
            ],
          },
        ],
      },
      sections: [{ children }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "简历"}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // 打印区域常驻 DOM（CSS 控制仅打印时显示），直接触发打印
    window.print();
  };

  /** 把 AI 回复文本插入到简历末尾 */
  const applyAiText = (text: string) => {
    const newBlock = textToHtml(text);
    setHtml((prev) => `${prev}${newBlock}`);
    setError("");
  };

  const sendChat = async () => {
    const txt = chatInput.trim();
    if (!txt || chatLoading) return;
    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: txt,
    };
    const history = [...chatMessages, userMsg];
    setChatMessages(history);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/resume-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, messages: history }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setChatMessages([
          ...history,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ ${data.error || "出错了"}`,
          },
        ]);
        setChatLoading(false);
        return;
      }
      setChatMessages([
        ...history,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.text || "（无回复）",
        },
      ]);
    } catch {
      setChatMessages([
        ...history,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ 网络异常，请重试",
        },
      ]);
    }
    setChatLoading(false);
  };

  return (
    <main className="page-wrap px-4 pb-20 pt-6">
      {/* 顶部工具条：标题 + 保存 */}
      {/* <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link
          to="/console/resumes"
          className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
        >
          返回列表
        </Link>
      </div> */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          {error}
        </div>
      )}

      {optimized && !optimizing && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1 leading-relaxed">
            AI 优化已应用到编辑器，包含文案与排版优化（标题 / 列表 /
            加粗）。请检查内容，确认后点击右侧「保存新版本」生成新版本，可在「历史版本」中随时回滚。
          </p>
          <button
            type="button"
            onClick={() => setOptimized(false)}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
            aria-label="关闭提示"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {styled && !styling && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1 leading-relaxed">
            已按「{getResumeTemplate(template).name}
            」样式重排简历结构（内容事实保持不变）。确认后点「保存新版本」，可在「历史版本」回滚。
          </p>
          <button
            type="button"
            onClick={() => setStyled(false)}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
            aria-label="关闭提示"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 两栏布局：中间编辑器（主）+ 右侧栏 */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 中间主区：A4 简历编辑器 */}
        <div className="min-w-0">
          <ResumeEditor
            ref={editorRef}
            content={resume.content}
            onChange={setHtml}
            template={template}
          />
        </div>

        {/* 右侧栏 */}
        <aside className="space-y-4">
          {/* 顶部操作：保存新版本 + 下载 */}
          <div>
            <div className="relative flex items-center gap-2">
            <Link
              to="/console/resumes"
              className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
            >
              返回列表
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : saved ? (
                <Check className="size-3.5" />
              ) : (
                <Save className="size-3.5" />
              )}
              {saved ? "已保存" : "保存新版本"}
            </button>
            <button
              type="button"
              onClick={() => setDlOpen(!dlOpen)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
            >
              <Download className="size-3.5" />
              下载
            </button>
            {dlOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-(--line) bg-(--surface-strong) p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    void handleDownloadDocx();
                    setDlOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
                >
                  Word (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrint();
                    setDlOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
                >
                  PDF（打印另存）
                </button>
              </div>
            )}
            </div>
            {dirty && (
              <p className="mt-2 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="relative flex size-2 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                </span>
                你还有未保存的修改，点「保存新版本」即可存档
              </p>
            )}
          </div>

          {/* 简历标题 */}
          <section className="island-shell rounded-2xl p-4">
            <div className="mb-1.5 block text-xs font-medium text-(--sea-ink-soft)">
              简历标题
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="简历标题"
            />
          </section>

          {/* 简历样式 */}
          <section className="island-shell rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <Palette className="size-4 text-(--lagoon-deep)" />
              <h2 className="text-sm font-semibold text-(--sea-ink)">
                简历样式
              </h2>
            </div>
            <p className="mb-2 text-xs text-(--sea-ink-soft)">
              选择样式即时预览；点下方按钮让 AI 按该样式重排简历结构（内容不变）
            </p>
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
              {RESUME_TEMPLATES.map((t) => {
                const on = template === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      setTemplate(t.id);
                      setStyled(false);
                    }}
                    title={t.description}
                    className={`shrink-0 snap-start rounded-xl border-2 p-1 transition ${
                      on
                        ? "border-(--lagoon-deep) bg-(--lagoon-deep)/5"
                        : "border-transparent hover:border-(--line)"
                    }`}
                  >
                    <TemplatePreview templateId={t.id} />
                    <span
                      className={`mt-1 block text-center text-xs font-medium ${on ? "text-(--lagoon-deep)" : "text-(--sea-ink)"}`}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => void handleApplyStyle()}
              disabled={styling}
              className="btn-gradient mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium disabled:pointer-events-none disabled:opacity-60"
            >
              {styling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {styling
                ? "AI 排版中…"
                : `AI 按「${getResumeTemplate(template).name}」重排`}
            </button>
          </section>

          {/* 历史版本（默认展开） */}
          <section className="island-shell overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setVersionsOpen(!versionsOpen)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <History className="size-4 text-(--sea-ink-soft)" />
              <span className="text-sm font-semibold text-(--sea-ink)">
                历史版本
              </span>
              <span className="text-xs text-(--sea-ink-soft)">
                共 {versions.length} 个
              </span>
              <span className="ml-auto text-(--sea-ink-soft)">
                {versionsOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </span>
            </button>

            {versionsOpen && (
              <div className="max-h-[46vh] space-y-2 overflow-auto border-t border-(--line) p-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-(--line) bg-(--surface) px-3 py-2"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-(--sea-ink)">
                        v{v.versionNo} · {v.note || "未命名"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setRollbackTarget(v.id)}
                        disabled={rollbacking === v.id}
                        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-input px-2 text-xs text-(--sea-ink-soft) transition hover:bg-accent disabled:opacity-50"
                      >
                        {rollbacking === v.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3" />
                        )}
                        回滚
                      </button>
                    </div>
                    <p className="text-xs text-(--sea-ink-soft)">
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleString("zh-CN")
                        : "-"}
                    </p>
                  </div>
                ))}
                {versions.length === 0 && (
                  <p className="py-2 text-xs text-(--sea-ink-soft)">
                    保存后生成版本
                  </p>
                )}
              </div>
            )}
          </section>

          {/* 目标岗位（内嵌折叠，默认关闭） */}
          <section className="island-shell overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setTargetsOpen(!targetsOpen)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <Target className="size-4 text-(--lagoon-deep)" />
              <span className="text-sm font-semibold text-(--sea-ink)">
                目标岗位
              </span>
              <span className="text-xs text-(--sea-ink-soft)">
                {targetIds.size > 0
                  ? `已选 ${targetIds.size}`
                  : `${jobs.length} 个岗位`}
              </span>
              <span className="ml-auto text-(--sea-ink-soft)">
                {targetsOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </span>
            </button>

            {targetsOpen && (
              <div className="border-t border-(--line)">
                <div className="space-y-4 px-4 py-3">
                  {hotGroups.length === 0 && (
                    <p className="text-xs text-(--sea-ink-soft)">暂无岗位</p>
                  )}
                  {hotGroups.map(([name, list]) => (
                    <div key={name}>
                      <p className="mb-1.5 text-xs font-semibold text-(--sea-ink)">
                        {name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {list.slice(0, 3).map((job) => {
                          const isOn = targetIds.has(job.id);
                          return (
                            <button
                              type="button"
                              key={job.id}
                              onClick={() => toggleTarget(job.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-2 pr-3 text-xs transition ${isOn ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)" : "border-input bg-(--surface-strong) text-(--sea-ink) hover:border-(--lagoon-deep)"}`}
                            >
                              <span
                                className={`flex size-3.5 shrink-0 items-center justify-center rounded border text-white ${isOn ? "border-(--lagoon-deep) bg-(--lagoon-deep)" : "border-input"}`}
                              >
                                {isOn && <span className="text-[9px]">✓</span>}
                              </span>
                              {job.title}
                            </button>
                          );
                        })}
                        {list.length > 3 && (
                          <span className="inline-flex items-center text-xs text-(--sea-ink-soft)">
                            等 {list.length} 个
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTargetsModalOpen(true)}
                    className="w-full rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-xs font-medium text-(--lagoon-deep) transition hover:bg-(--lagoon-deep)/10"
                  >
                    更多岗位（{jobs.length} 个）
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Markdown 说明 */}
          <section className="island-shell rounded-2xl p-4">
            <p className="mb-2 text-xs font-semibold text-(--sea-ink)">
              支持 Markdown 语法
            </p>
            <p className="text-xs leading-relaxed text-(--sea-ink-soft)">
              在编辑区用 Markdown 输入，按空格 / 回车自动排版：
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "# 标题",
                "**加粗**",
                "*斜体*",
                "- 列表",
                "1. 有序",
                "> 引用",
                "`代码`",
                "--- 分割线",
              ].map((t) => (
                <code
                  key={t}
                  className="rounded border border-(--line) bg-(--surface) px-1.5 py-0.5 text-[11px] text-(--sea-ink-soft)"
                >
                  {t}
                </code>
              ))}
            </div>
          </section>
          {/* 一键 AI 优化 */}
          <section className="island-shell rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <Wand2 className="size-4 text-(--lagoon-deep)" />
              <h2 className="text-sm font-semibold text-(--sea-ink)">
                一键 AI 优化
              </h2>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-(--sea-ink-soft)">
              重写文案并重新排版（标题 / 列表 /
              加粗），保留真实经历、贴合目标岗位。结果直接应用到编辑器，保存后可在「历史版本」回滚。
            </p>
            <button
              type="button"
              onClick={() => void handleOptimize()}
              disabled={optimizing}
              className="btn-gradient inline-flex h-9 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium disabled:pointer-events-none disabled:opacity-60"
            >
              {optimizing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {optimizing ? "AI 优化中…" : "AI 优化全文"}
            </button>
          </section>

          {/* AI 修改（聊天） */}
          <section className="island-shell overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setAiOpen(!aiOpen)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <Sparkles className="size-4 text-(--lagoon-deep)" />
              <span className="text-sm font-semibold text-(--sea-ink)">
                AI 修改
              </span>
              <span className="text-xs text-(--sea-ink-soft)">
                基于真实数据底座，不是通用套话
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-(--lagoon-deep)/10 px-2 py-1 font-medium text-(--lagoon-deep)">
                    岗位 {jobs.length} 个
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-(--lagoon-deep)/10 px-2 py-1 font-medium text-(--lagoon-deep)">
                    {companies.length} 家 AI 公司
                  </span>
                </div>
              </span>
              <span className="ml-auto text-(--sea-ink-soft)">
                {aiOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </span>
            </button>

            {aiOpen && (
              <div className="border-t border-(--line)">
                {/* 聊天消息区 */}
                <div className="max-h-72 min-h-32 space-y-3 overflow-y-auto px-4 py-3">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-(--sea-ink-soft)">
                      例：「帮我优化工作经历」/「把自我介绍写得更突出 AI
                      能力」。
                    </p>
                  )}
                  {chatMessages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-(--lagoon-deep) px-3 py-2 text-sm text-white">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex gap-2">
                        <div className="min-w-0 max-w-[88%] rounded-2xl rounded-bl-md bg-(--surface) px-3 py-2 text-sm leading-relaxed text-(--sea-ink)">
                          <Streamdown>{m.content}</Streamdown>
                          {!m.content.startsWith("⚠️") && (
                            <button
                              type="button"
                              onClick={() => applyAiText(m.content)}
                              className="mt-2 inline-flex h-7 items-center gap-1 rounded-md border border-(--lagoon-deep)/50 px-2 text-xs text-(--lagoon-deep) transition hover:bg-(--lagoon-deep)/10"
                            >
                              <Save className="size-3" /> 插入到简历
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                  {chatLoading && (
                    <div className="flex gap-2">
                      <div className="rounded-2xl rounded-bl-md bg-(--surface) px-3 py-2 text-sm text-(--sea-ink-soft)">
                        <Loader2 className="size-4 animate-spin" /> AI 正在修改…
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* 输入框 */}
                <div className="border-t border-(--line) p-2">
                  <div className="flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) p-1.5">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void sendChat();
                      }}
                      disabled={chatLoading}
                      placeholder="输入指令，让 AI 改简历…"
                      className="h-8 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => void sendChat()}
                      disabled={!chatInput.trim() || chatLoading}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-(--lagoon-deep) px-3 text-xs font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {chatLoading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      发送
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* 打印区域：Portal 到 body，打印时独立于应用内容 */}
      {typeof document !== "undefined" &&
        createPortal(
          <div id="print-area" className="print-area">
            <div className={`print-a4 resume-template-${template}`}>
              <div
                className="print-a4-body"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: 打印区域需渲染编辑器原始 HTML
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>,
          document.body,
        )}

      <style>{`
        #print-area { display: none; }
        @media print {
          /* 只显示 body 直接子里的打印区，其余全部隐藏（不占布局，无空白尾页） */
          body > *:not(#print-area) { display: none !important; }
          #print-area { display: block !important; position: static; background: #fff; }
          .print-a4 { width: 190mm; margin: 0 auto; padding: 8mm 0; background: #fff; box-sizing: border-box; }
          .print-a4-body { font-size: 14px; line-height: 1.7; color: #1a1a1a; }
          .print-a4-body p { margin: 0.4em 0; }
          .print-a4-body h1 { font-size: 20px; font-weight: 700; text-align: left; }
          .print-a4-body h2 { font-size: 15px; font-weight: 700; margin: 0.8em 0 0.3em; border-bottom: 1px solid #d0d0d0; padding-bottom: 2px; }
          .print-a4-body h3 { font-size: 14px; font-weight: 700; margin: 0.6em 0 0.2em; }
          .print-a4-body ul, .print-a4-body ol { padding-left: 1.4em; margin: 0.3em 0; }
          .print-a4-body li { margin: 0.15em 0; }
          .print-a4-body strong { font-weight: 700; }
          .print-a4-body a { color: #0f766e; text-decoration: none; }
        }
      `}</style>
      {/* 更多岗位弹窗 */}
      <Dialog.Root
        open={targetsModalOpen}
        onOpenChange={(v) => !v && setTargetsModalOpen(false)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex max-h-[88vh] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--line) px-4 py-3">
              <Dialog.Title className="text-base font-semibold text-(--sea-ink)">
                选择目标岗位
              </Dialog.Title>
              <button
                type="button"
                onClick={() => setTargetsModalOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-(--line) text-(--sea-ink) transition hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            {/* 工具栏：搜索 + 已选 */}
            <div className="flex flex-wrap items-center gap-3 border-b border-(--line) px-4 py-2.5">
              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="搜索公司 / 岗位 / 城市…"
                className="h-8 w-full flex-1 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              />
              <span className="shrink-0 text-xs text-(--sea-ink-soft)">
                已选 <b className="text-(--lagoon-deep)">{targetIds.size}</b>
              </span>
            </div>
            {/* 两列网格岗位卡片 */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {filteredJobs.length === 0 ? (
                <p className="py-10 text-center text-sm text-(--sea-ink-soft)">
                  未找到匹配岗位
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredJobs.map((job) => {
                    const isOn = targetIds.has(job.id);
                    const cities = (job.jobCities ?? [])
                      .map((cn) => cn.city)
                      .join("/");
                    return (
                      <button
                        type="button"
                        key={job.id}
                        onClick={() => toggleTarget(job.id)}
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${isOn ? "border-(--lagoon-deep) bg-[rgba(124,58,237,0.08)]" : "border-(--line) bg-(--surface) hover:border-(--lagoon-deep)"}`}
                      >
                        <span
                          className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border transition ${isOn ? "border-(--lagoon-deep) bg-(--lagoon-deep) text-white" : "border-input"}`}
                        >
                          {isOn && <span className="text-[10px]">✓</span>}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-(--sea-ink)">
                            {job.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-(--sea-ink-soft)">
                            {job.company?.name ?? "未知公司"}
                            {cities ? ` · ${cities}` : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t border-(--line) px-4 py-3">
              <button
                type="button"
                onClick={() => void saveTargets()}
                disabled={targetsSaving}
                className="btn-gradient inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-medium disabled:opacity-50"
              >
                {targetsSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {targetIds.size === 0
                  ? "保存（未选）"
                  : `保存（${targetIds.size} 个岗位）`}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* 回滚确认弹窗 */}
      <ConfirmDialog
        open={rollbackTarget != null}
        onClose={() => setRollbackTarget(null)}
        title="回滚版本"
        message="确定回滚到该版本吗？当前内容将被替换（可再次保存生成新版本）。"
        confirmText="回滚"
        danger
        onConfirm={() =>
          rollbackTarget != null && void handleRollback(rollbackTarget)
        }
      />
    </main>
  );
}

/** 把 HTML 转成 docx 段落元素（支持标题/段落/列表/加粗/斜体） */
function htmlToDocxParagraphs(
  html: string,
  {
    Paragraph,
    TextRun,
    HeadingLevel,
  }: {
    Paragraph: typeof import("docx").Paragraph;
    TextRun: typeof import("docx").TextRun;
    HeadingLevel: typeof import("docx").HeadingLevel;
  },
) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  const blocks: InstanceType<typeof import("docx").Paragraph>[] = [];

  const runs = (el: Element): InstanceType<typeof import("docx").TextRun>[] => {
    return Array.from(el.childNodes).map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return new TextRun({ text: node.textContent ?? "" });
      }
      const n = node as Element;
      const text = n.textContent ?? "";
      const tag = n.tagName.toLowerCase();
      const opts = {
        text,
        ...(tag === "strong" || tag === "b" ? { bold: true } : {}),
        ...(tag === "em" || tag === "i" ? { italics: true } : {}),
        ...(tag === "u" ? { underline: {} } : {}),
        ...(tag === "code" || tag === "pre" ? { font: "Consolas" } : {}),
        ...(tag === "a" ? { color: "328F97" } : {}),
      };
      return new TextRun(opts);
    });
  };

  body.querySelectorAll(":scope > *").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "h1") {
      blocks.push(
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(el) }),
      );
    } else if (tag === "h2") {
      blocks.push(
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(el) }),
      );
    } else if (tag === "h3") {
      blocks.push(
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(el) }),
      );
    } else if (tag === "ul") {
      (el as Element).querySelectorAll(":scope > li").forEach((li) => {
        blocks.push(
          new Paragraph({ bullet: { level: 0 }, children: runs(li) }),
        );
      });
    } else if (tag === "ol") {
      (el as Element).querySelectorAll(":scope > li").forEach((li) => {
        blocks.push(
          new Paragraph({
            numbering: { reference: "ordered-list", level: 0 },
            children: runs(li),
          }),
        );
      });
    } else if (tag === "blockquote") {
      blocks.push(new Paragraph({ indent: { left: 360 }, children: runs(el) }));
    } else if (tag === "hr") {
      blocks.push(new Paragraph({ text: "" }));
    } else {
      blocks.push(new Paragraph({ children: runs(el) }));
    }
  });

  return blocks;
}

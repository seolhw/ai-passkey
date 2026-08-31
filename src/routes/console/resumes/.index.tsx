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
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";

import ResumeEditor from "#/components/resume/ResumeEditor";
import {
  getResume,
  listVersions,
  rollbackVersion,
  saveResume,
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
    return { resume, versions };
  },
});

type ChatMsg = { role: "user" | "assistant"; content: string };

function ResumeDetailPage() {
  const { resume, versions } = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState(resume.title);
  const [html, setHtml] = useState(resume.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [rollbacking, setRollbacking] = useState<number | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [error, setError] = useState("");

  // 右侧栏折叠状态：历史版本默认展开，AI 修改默认展开
  const [versionsOpen, setVersionsOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  // AI 修改（聊天）
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const pending = useRef(false);

  useEffect(() => {
    setTitle(resume.title);
    setHtml(resume.content);
  }, [resume]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, chatLoading]);

  const plainText = useMemo(() => htmlToText(html), [html]);

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

  const handleRollback = async (versionId: number) => {
    if (
      !confirm("确定回滚到该版本吗？当前内容将丢失（可通过再次保存生成新版本）")
    )
      return;
    setRollbacking(versionId);
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
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 100);
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
    const userMsg: ChatMsg = { role: "user", content: txt };
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
        setChatMessages([...history, { role: "assistant", content: `⚠️ ${data.error || "出错了"}` }]);
        setChatLoading(false);
        return;
      }
      setChatMessages([...history, { role: "assistant", content: data.text || "（无回复）" }]);
    } catch {
      setChatMessages([...history, { role: "assistant", content: "⚠️ 网络异常，请重试" }]);
    }
    setChatLoading(false);
  };

  return (
    <main className="page-wrap px-4 pb-20 pt-6">
      {/* 顶部工具条：标题 + 保存 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link
          to="/console/resumes"
          className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
        >
          返回列表
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 sm:max-w-xs"
          placeholder="简历标题"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saved ? "已保存" : "保存新版本"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          {error}
        </div>
      )}

      {/* 两栏布局：中间编辑器（主）+ 右侧栏 */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 中间主区：A4 简历编辑器 */}
        <div className="min-w-0">
          <ResumeEditor content={resume.content} onChange={setHtml} />
        </div>

        {/* 右侧栏 */}
        <aside className="space-y-4">
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
                输入指令，像聊天一样
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
                      例：「帮我优化工作经历」/「把自我介绍写得更突出 AI 能力」。
                    </p>
                  )}
                  {chatMessages.map((m, i) =>
                    m.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-(--lagoon-deep) px-3 py-2 text-sm text-white">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-2">
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
                        onClick={() => void handleRollback(v.id)}
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

          {/* 目标岗位 + 下载 */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/console/resumes/$resumeId/targets"
              params={{ resumeId: String(resume.id) }}
              className="island-shell flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 text-center no-underline transition hover:border-(--lagoon-deep)"
            >
              <Target className="size-5 text-(--lagoon-deep)" />
              <span className="text-sm font-medium text-(--sea-ink)">
                目标岗位
              </span>
            </Link>
            <div className="island-shell flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 text-center">
              <button
                type="button"
                onClick={() => void handleDownloadDocx()}
                className="flex flex-col items-center gap-1.5"
              >
                <Download className="size-5 text-(--lagoon-deep)" />
                <span className="text-sm font-medium text-(--sea-ink)">
                  下载 Word
                </span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="text-xs text-(--sea-ink-soft) hover:text-(--sea-ink)"
              >
                PDF（打印）
              </button>
            </div>
          </div>

          {/* Markdown 说明 */}
          <section className="island-shell rounded-2xl p-4">
            <p className="mb-2 text-xs font-semibold text-(--sea-ink)">
              支持 Markdown 语法
            </p>
            <p className="text-xs leading-relaxed text-(--sea-ink-soft)">
              在编辑区用 Markdown 输入，按空格 / 回车自动排版：
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["# 标题", "**加粗**", "*斜体*", "- 列表", "1. 有序", "> 引用", "`代码`", "--- 分割线"].map(
                (t) => (
                  <code
                    key={t}
                    className="rounded border border-(--line) bg-(--surface) px-1.5 py-0.5 text-[11px] text-(--sea-ink-soft)"
                  >
                    {t}
                  </code>
                ),
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* 打印区域（隐藏于正常浏览） */}
      {showPrint && (
        <div id="print-area" className="print-area">
          <h1>{title}</h1>
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: 打印区域需渲染编辑器原始 HTML
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-area h1 { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 16px; }
          .print-area p { margin: 4px 0; line-height: 1.6; }
        }
      `}</style>
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

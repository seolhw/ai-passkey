import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  Check,
  Download,
  History,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ResumeEditor from "#/components/resume/ResumeEditor";
import {
  getResume,
  listVersions,
  rollbackVersion,
  saveResume,
} from "#/lib/resume-api";
import { htmlToText } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/resumes/$resumeId")({
  component: ResumeDetailPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
  loader: async ({ params }) => {
    const resume = await getResume({ data: { id: Number(params.resumeId) } });
    if (!resume) throw redirect({ to: "/resumes" });
    const versions = await listVersions({ data: { id: resume.id } });
    return { resume, versions };
  },
});

function ResumeDetailPage() {
  const { resume, versions } = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState(resume.title);
  const [html, setHtml] = useState(resume.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [rollbacking, setRollbacking] = useState<number | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  useEffect(() => {
    setTitle(resume.title);
    setHtml(resume.content);
  }, [resume]);

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
    setShowVersions(false);
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

  return (
    <main className="page-wrap px-4 pb-20 pt-8">
      {/* 工具栏 */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          to="/resumes"
          className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
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
        <button
          type="button"
          onClick={() => setShowVersions(!showVersions)}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
        >
          <History className="size-4" />
          版本历史
        </button>
        <Link
          to="/resumes/$resumeId/targets"
          params={{ resumeId: String(resume.id) }}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
        >
          <Target className="size-4" />
          目标岗位
        </Link>
        <Link
          to="/resumes/$resumeId/polish"
          params={{ resumeId: String(resume.id) }}
          className="btn-gradient inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium no-underline"
        >
          <Sparkles className="size-4" />
          AI 润色
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPrint(!showPrint)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
          >
            <Download className="size-4" />
            下载
          </button>
          {showPrint && (
            <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-1 shadow-lg">
              <button
                type="button"
                onClick={() => void handleDownloadDocx()}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
              >
                Word (.docx)
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
              >
                PDF（打印另存）
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          {error}
        </div>
      )}

      {/* 版本历史面板 */}
      {showVersions && (
        <section className="island-shell mb-6 rounded-2xl p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
            版本历史（共 {versions.length} 个版本）
          </h3>
          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--sea-ink)]">
                    v{v.versionNo} · {v.note || "未命名"}
                  </p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    {v.createdAt
                      ? new Date(v.createdAt).toLocaleString("zh-CN")
                      : "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRollback(v.id)}
                  disabled={rollbacking === v.id}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent disabled:opacity-50"
                >
                  {rollbacking === v.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )}
                  回滚到此版本
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-xs shadow-xs outline-none focus-visible:border-ring dark:bg-input/30"
              placeholder="本次修改说明（如：润色后 v3）"
            />
            <span className="text-xs text-[var(--sea-ink-soft)]">
              保存时写入版本说明
            </span>
          </div>
        </section>
      )}

      {/* 编辑器 */}
      <ResumeEditor content={resume.content} onChange={setHtml} />

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

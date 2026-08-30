import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ClipboardPaste, Loader2, Upload } from "lucide-react";
import { useState } from "react";

import { createResume } from "#/lib/resume-api";
import { parseFileToPlainText, textToHtml } from "#/lib/resume-utils";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/resumes/new")({
  component: NewResumePage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
});

function NewResumePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [title, setTitle] = useState("");
  const [plainText, setPlainText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setParsing(true);
    setError("");
    try {
      const text = await parseFileToPlainText(file);
      setPlainText(text);
      if (!title) {
        setTitle(file.name.replace(/\.[^.]+$/, ""));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件解析失败");
    } finally {
      setParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!plainText.trim()) {
      setError("请先上传文件或粘贴简历内容");
      return;
    }
    setCreating(true);
    setError("");
    const resume = await createResume({
      data: {
        title,
        content: textToHtml(plainText),
        plainText,
      },
    });
    if (resume) {
      await navigate({
        to: "/resumes/$resumeId",
        params: { resumeId: String(resume.id) },
      });
    } else {
      setError("创建失败，请重新登录后重试");
      setCreating(false);
    }
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-12">
      <header className="mb-8">
        <p className="island-kicker mb-2">跨界简历</p>
        <h1 className="display-title text-3xl font-bold text-(--sea-ink)">
          新建简历
        </h1>
        <p className="mt-2 text-sm text-(--sea-ink-soft)">
          支持上传 PDF / Word / TXT，解析后自动转为可编辑内容
        </p>
      </header>

      <section className="island-shell rounded-2xl p-6">
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${
              mode === "upload"
                ? "bg-primary text-primary-foreground"
                : "border border-input text-(--sea-ink-soft) hover:bg-accent"
            }`}
          >
            <Upload className="size-4" />
            上传文件
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${
              mode === "paste"
                ? "bg-primary text-primary-foreground"
                : "border border-input text-(--sea-ink-soft) hover:bg-accent"
            }`}
          >
            <ClipboardPaste className="size-4" />
            粘贴文本
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="resume-title"
              className="text-sm font-medium leading-none"
            >
              简历标题
            </label>
            <input
              id="resume-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="例如：张三 - 算法工程师"
            />
          </div>

          {mode === "upload" ? (
            <div className="grid gap-3">
              <label
                htmlFor="file-upload"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--line) bg-(--surface) p-6 text-center transition hover:border-(--lagoon-deep) hover:bg-(--link-bg-hover)"
              >
                {parsing ? (
                  <Loader2 className="size-8 animate-spin text-(--lagoon-deep)" />
                ) : (
                  <Upload className="size-8 text-(--sea-ink-soft)" />
                )}
                <span className="text-sm font-medium text-(--sea-ink)">
                  {parsing ? "正在解析…" : "点击选择或拖拽文件"}
                </span>
                <span className="text-xs text-(--sea-ink-soft)">
                  支持 .pdf / .docx / .txt
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <label
                htmlFor="resume-text"
                className="text-sm font-medium leading-none"
              >
                简历文本
              </label>
              <textarea
                id="resume-text"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="min-h-56 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder={"姓名：\n联系方式：\n\n教育经历\n…"}
              />
            </div>
          )}

          {plainText && (
            <div className="rounded-lg border border-(--line) bg-(--surface) p-3">
              <p className="mb-1 text-xs font-medium text-(--sea-ink-soft)">
                解析结果预览（{plainText.length} 字）
              </p>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-(--sea-ink-soft)">
                {plainText}
              </pre>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating || parsing}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {creating ? "创建中…" : "创建并进入编辑器"}
          </button>
        </div>
      </section>
    </main>
  );
}

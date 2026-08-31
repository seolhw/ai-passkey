import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Maximize2,
  Minus,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";

import { deleteResume, listResumes } from "#/lib/resume-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/resumes/")({
  component: ResumesPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async () => await listResumes(),
});

/** 放大弹窗内 A4 内容字号放大倍率（按档位） */
const ZOOM_STEPS = [1, 1.3, 1.6];

type ResumeRow = NonNullable<Awaited<ReturnType<typeof listResumes>>>[number];

function ResumesPage() {
  const resumes = Route.useLoaderData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<ResumeRow | null>(null);
  const [modalZoom, setModalZoom] = useState(0);

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该简历吗？其所有版本将一并删除")) return;
    await deleteResume({ data: { id } });
    await router.invalidate();
  };

  const openZoom = (r: ResumeRow) => {
    setViewing(r);
    setModalZoom(0);
  };
  const zoomUp = () =>
    setModalZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1));
  const zoomDown = () => setModalZoom((z) => Math.max(0, z - 1));

  const modalZoomScale = ZOOM_STEPS[modalZoom] ?? 1;

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">我的简历</p>
          <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
            我的简历
          </h1>
          <p className="mt-1 text-sm text-(--sea-ink-soft)">
            上传、修改、版本管理，全流程闭环
          </p>
        </div>
        <Link
          to="/console/resumes/new"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          新建简历
        </Link>
      </header>

      {resumes.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-16 text-center">
          <FileText className="mx-auto mb-4 size-12 text-(--sea-ink-soft)" />
          <h2 className="mb-2 text-lg font-semibold text-(--sea-ink)">
            还没有简历
          </h2>
          <p className="mb-6 text-sm text-(--sea-ink-soft)">
            上传一份现有简历，或用简历大厅的优质模板快速开始
          </p>
          <Link
            to="/console/resumes/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Plus className="size-4" />
            上传我的第一份简历
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const isOpen = expandedId === resume.id;
            return (
              <article key={resume.id}>
                {/* 一张 A4 白纸简历 */}
                <div
                  className={`library-paper relative w-full rounded-[3px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_14px_34px_-14px_rgba(15,23,42,0.28)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_22px_44px_-14px_rgba(15,23,42,0.35)] dark:border-zinc-600 ${
                    isOpen
                      ? "max-h-[80vh] overflow-y-auto overflow-x-hidden"
                      : "aspect-[210/297] overflow-hidden"
                  }`}
                >
                  {/* 右上角固定操作条（无依赖 hover）：全文 / 放大 / 编辑 / 删除 */}
                  <div className="sticky top-2 z-10 flex justify-end gap-2 px-2 pt-2">
                    <Link
                      to="/console/resumes/$resumeId"
                      params={{ resumeId: String(resume.id) }}
                      title="编辑简历"
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white no-underline backdrop-blur transition hover:bg-zinc-800"
                    >
                      <Pencil className="size-3.5" /> 编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : resume.id)}
                      title={isOpen ? "收起" : "展开全文"}
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                    >
                      {isOpen ? (
                        <>
                          <EyeOff className="size-3.5" /> 收起
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" /> 全文
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openZoom(resume)}
                      title="放大阅读"
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                    >
                      <Maximize2 className="size-3.5" /> 放大
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(resume.id)}
                      title="删除"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-white backdrop-blur transition hover:bg-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* A4 内容 */}
                  <div className="py-10">
                    <div className="px-8">
                      <h1 className="mb-4 text-center text-xl font-bold tracking-widest text-zinc-800">
                        {resume.title}
                      </h1>
                      <div
                        className="library-paper-content"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染已保存的简历 HTML
                        dangerouslySetInnerHTML={{ __html: resume.content }}
                      />
                    </div>
                  </div>

                  {/* 底部渐变遮罩（折叠态） */}
                  {!isOpen && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/55 to-white" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 放大弹窗：A4 简历整页阅读，内置字号放大/缩小 */}
      <Dialog.Root open={viewing != null} onOpenChange={(v) => !v && setViewing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex max-h-[92vh] w-[min(92vw,860px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl">
            {/* 顶栏：字号控制 + 关闭 */}
            <div className="flex items-center justify-between gap-3 border-b border-(--line) bg-(--surface-strong) px-4 py-2.5">
              <Dialog.Title className="truncate text-base font-semibold text-(--sea-ink)">
                {viewing?.title ?? "简历"}
              </Dialog.Title>
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex h-8 items-center overflow-hidden rounded-md border border-(--line) bg-(--surface) transition ${
                    modalZoom > 0 ? "ring-1 ring-lime-400/70" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={zoomDown}
                    aria-label="缩小字号"
                    title="缩小字号"
                    disabled={modalZoom === 0}
                    className="flex h-full items-center px-2 text-(--sea-ink) transition hover:bg-accent disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="px-1 text-xs tabular-nums text-(--sea-ink-soft)">
                    {1 + modalZoom}/{ZOOM_STEPS.length}
                  </span>
                  <button
                    type="button"
                    onClick={zoomUp}
                    aria-label="放大字号"
                    title="放大字号"
                    disabled={modalZoom === ZOOM_STEPS.length - 1}
                    className="flex h-full items-center px-2 text-(--sea-ink) transition hover:bg-accent disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Dialog.Close
                  asChild
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--line) bg-(--surface) text-(--sea-ink) transition hover:bg-accent"
                >
                  <button type="button" aria-label="关闭" title="关闭">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* A4 简历内容区（可滚动） */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-(--sea-ink)/5 p-4 sm:p-6">
              <Dialog.Description asChild>
                <div className="sr-only">简历放大阅读</div>
              </Dialog.Description>
              <div
                className="library-paper mx-auto aspect-[210/297] w-[min(100%,70vh)] overflow-hidden rounded-[3px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_16px_40px_-16px_rgba(15,23,42,0.35)] transition-[font-size] dark:border-zinc-600"
                style={{ fontSize: `${11 * modalZoomScale}px` }}
              >
                <div className="h-full overflow-y-auto px-10 py-8">
                  <div className="library-paper-content">
                  <h1 className="mb-4 text-center text-[1.6em] font-bold tracking-widest">
                    {viewing?.title ?? ""}
                  </h1>
                  {viewing && (
                    <div className="mb-3 mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" /> 更新于{" "}
                        {viewing.updatedAt
                          ? new Date(viewing.updatedAt).toLocaleDateString(
                              "zh-CN",
                            )
                          : "-"}
                      </span>
                      <Link
                        to="/console/resumes/$resumeId"
                        params={{ resumeId: String(viewing.id) }}
                        onMouseDown={() => setViewing(null)}
                        className="inline-flex items-center gap-1 text-zinc-600 no-underline hover:underline"
                      >
                        <Pencil className="size-3.5" /> 进入编辑器
                      </Link>
                    </div>
                  )}
                  {viewing && (
                    <div
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染已保存的简历 HTML
                      dangerouslySetInnerHTML={{ __html: viewing.content }}
                    />
                  )}
                </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

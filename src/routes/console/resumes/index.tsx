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
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import ConfirmDialog from "#/components/ConfirmDialog";
import DetailModal from "#/components/DetailModal";

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


type ResumeRow = NonNullable<Awaited<ReturnType<typeof listResumes>>>[number];

function ResumesPage() {
  const resumes = Route.useLoaderData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<ResumeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResumeRow | null>(null);

  const handleDelete = async (id: number) => {
    await deleteResume({ data: { id } });
    setDeleteTarget(null);
    await router.invalidate();
  };

  const openDetail = (r: ResumeRow) => setViewing(r);

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
                  {/* 右上角固定操作条：详情(主) / 展开全文 / 编辑 / 删除 */}
                  <div className="sticky top-2 z-10 flex justify-end gap-2 px-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openDetail(resume)}
                      title="查看详情"
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-(--lagoon-deep) px-2.5 text-xs font-medium text-white backdrop-blur transition hover:opacity-90"
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : resume.id)}
                      title={isOpen ? "收起" : "展开全文"}
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                    >
                      {isOpen ? (<><EyeOff className="size-3.5" /> 收起</>) : (<><Eye className="size-3.5" /> 展开全文</>)}
                    </button>
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
                      onClick={() => setDeleteTarget(resume)}
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
                        className="library-paper-content" style={{ fontSize: "14px" }}
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

      {/* 详情弹窗：A4 简历整页阅读 */}
      <DetailModal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={viewing ? `简历 · ${viewing.title}` : "简历详情"}
      >
        {viewing && (
          <div className="mx-auto w-full max-w-[780px]">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" /> 更新于{" "}
                {viewing.updatedAt
                  ? new Date(viewing.updatedAt).toLocaleDateString("zh-CN")
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
            <div className="library-paper min-h-[297mm] overflow-hidden rounded-[2px] border border-zinc-200 bg-white shadow-sm">
              <div className="p-8">
              <div className="library-paper-content" style={{ fontSize: "14px" }}>
                <h1 className="mb-4 text-center text-[1.6em] font-bold tracking-widest">{viewing.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: viewing.content }} />
              </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="删除简历"
        message="确定删除该简历吗？其所有版本将一并删除，此操作不可恢复。"
        confirmText="删除"
        danger
        onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
      />
    </main>
  );
}

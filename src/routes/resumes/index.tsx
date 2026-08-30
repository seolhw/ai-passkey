import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { FileText, Plus, Trash2 } from "lucide-react";

import { deleteResume, listResumes } from "#/lib/resume-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/resumes/")({
  component: ResumesPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async () => await listResumes(),
});

function ResumesPage() {
  const resumes = Route.useLoaderData();
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该简历吗？其所有版本将一并删除")) return;
    await deleteResume({ data: { id } });
    await router.invalidate();
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="island-kicker mb-2">跨界简历</p>
          <h1 className="display-title text-3xl font-bold text-(--sea-ink)">
            我的简历
          </h1>
          <p className="mt-2 text-sm text-(--sea-ink-soft)">
            上传、修改、版本管理，全流程闭环
          </p>
        </div>
        <Link
          to="/resumes/new"
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
            to="/resumes/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Plus className="size-4" />
            上传我的第一份简历
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <article
              key={resume.id}
              className="island-shell group relative rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <Link
                to="/resumes/$resumeId"
                params={{ resumeId: String(resume.id) }}
                className="block no-underline"
              >
                <h2 className="mb-1 truncate text-base font-semibold text-(--sea-ink)">
                  {resume.title}
                </h2>
                <p className="mb-4 line-clamp-3 text-sm text-(--sea-ink-soft)">
                  {resume.plainText.slice(0, 120) || "（空简历）"}
                </p>
                <p className="text-xs text-(--sea-ink-soft)">
                  更新于{" "}
                  {resume.updatedAt
                    ? new Date(resume.updatedAt).toLocaleDateString("zh-CN")
                    : "-"}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(resume.id)}
                className="absolute right-3 top-3 rounded-full p-2 text-(--sea-ink-soft) opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                title="删除"
              >
                <Trash2 className="size-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

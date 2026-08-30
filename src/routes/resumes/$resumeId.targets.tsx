import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Check, Loader2, Save, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listJobs } from "#/lib/company-api";
import {
  getResume,
  listResumeTargets,
  setResumeTargets,
} from "#/lib/resume-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/resumes/$resumeId/targets")({
  component: TargetsPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
  loader: async ({ params }) => {
    const resume = await getResume({ data: { id: Number(params.resumeId) } });
    if (!resume) throw redirect({ to: "/resumes" });
    const [jobs, selected] = await Promise.all([
      listJobs(),
      listResumeTargets({ data: { resumeId: resume.id } }),
    ]);
    return { resume, jobs, selected };
  },
});

function TargetsPage() {
  const { resume, jobs, selected } = Route.useLoaderData();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(selected.map((j) => j.id)),
  );
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedIds(new Set(selected.map((j) => j.id)));
  }, [selected]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof jobs>();
    jobs.forEach((job) => {
      const name = job.company?.name ?? "未知公司";
      const arr = map.get(name) ?? [];
      arr.push(job);
      map.set(name, arr);
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "zh"),
    );
  }, [jobs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.trim().toLowerCase();
    return grouped
      .map(
        ([name, list]) =>
          [
            name,
            list.filter(
              (j) =>
                j.title.toLowerCase().includes(q) ||
                name.toLowerCase().includes(q) ||
                (j.location ?? "").toLowerCase().includes(q),
            ),
          ] as const,
      )
      .filter(([, list]) => list.length > 0);
  }, [grouped, search]);

  const toggle = (jobId: number) => {
    const next = new Set(selectedIds);
    if (next.has(jobId)) next.delete(jobId);
    else next.add(jobId);
    setSelectedIds(next);
  };

  const toggleCompany = (name: string) => {
    const list = grouped.find(([n]) => n === name)?.[1] ?? [];
    const allSelected = list.every((j) => selectedIds.has(j.id));
    const next = new Set(selectedIds);
    list.forEach((j) => {
      if (allSelected) next.delete(j.id);
      else next.add(j.id);
    });
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setSaving(true);
    await setResumeTargets({
      data: { resumeId: resume.id, jobIds: Array.from(selectedIds) },
    });
    setSaving(false);
    await router.navigate({
      to: "/resumes/$resumeId/polish",
      params: { resumeId: String(resume.id) },
    });
  };

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
        <div>
          <p className="island-kicker mb-1">目标岗位</p>
          <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
            选择目标公司与岗位
          </h1>
          <p className="mt-1 text-sm text-(--sea-ink-soft)">
            修改时会把所选岗位的 JD 注入提示词，精准匹配简历
          </p>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="搜索公司 / 岗位 / 地点…"
        />
        <span className="text-sm text-(--sea-ink-soft)">
          已选 {selectedIds.size} 个岗位
        </span>
      </div>

      {filtered.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <Target className="mx-auto mb-3 size-10 text-(--sea-ink-soft)" />
          <p className="text-sm text-(--sea-ink-soft)">未找到匹配岗位</p>
        </section>
      ) : (
        <div className="grid gap-4">
          {filtered.map(([name, list]) => {
            const allSelected = list.every((j) => selectedIds.has(j.id));
            const someSelected = list.some((j) => selectedIds.has(j.id));
            return (
              <section key={name} className="island-shell rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-(--sea-ink)">
                    {name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleCompany(name)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded border ${
                        allSelected
                          ? "border-(--lagoon-deep) bg-(--lagoon-deep) text-white"
                          : someSelected
                            ? "border-(--lagoon-deep)"
                            : "border-input"
                      }`}
                    >
                      {allSelected && <Check className="size-3" />}
                    </span>
                    {allSelected ? "取消全选" : "全选"}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {list.map((job) => {
                    const isOn = selectedIds.has(job.id);
                    return (
                      <button
                        type="button"
                        key={job.id}
                        onClick={() => toggle(job.id)}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                          isOn
                            ? "border-(--lagoon-deep) bg-[rgba(124,58,237,0.08)]"
                            : "border-(--line) bg-(--surface) hover:border-(--lagoon-deep)"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                            isOn
                              ? "border-(--lagoon-deep) bg-(--lagoon-deep) text-white"
                              : "border-input"
                          }`}
                        >
                          {isOn && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-(--sea-ink)">
                            {job.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-(--sea-ink-soft)">
                            {[job.salary, job.location]
                              .filter(Boolean)
                              .join(" · ") || "薪资面议"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || selectedIds.size === 0}
          className="btn-gradient inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium shadow-lg disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {selectedIds.size === 0 ? "请先选择岗位" : "保存并开始修改"}
        </button>
      </div>
    </main>
  );
}

import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listJobs } from "#/lib/company-api";
import {
  getResume,
  listResumeTargets,
  setResumeTargets,
} from "#/lib/resume-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/resumes/$resumeId/targets")({
  component: TargetsPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async ({ params }) => {
    const resume = await getResume({ data: { id: Number(params.resumeId) } });
    if (!resume) throw redirect({ to: "/console/resumes" });
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
  const [openCompanies, setOpenCompanies] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedIds(new Set(selected.map((j) => j.id)));
  }, [selected]);

  // 按公司分组
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

  // 搜索过滤（输入关键词时逐步收窄）
  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.trim().toLowerCase();
    return grouped
      .map(([name, list]) => [
        name,
        list.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            name.toLowerCase().includes(q) ||
            j.jobCities?.some((c) => c.city.toLowerCase().includes(q)),
        ),
      ] as const)
      .filter(([, list]) => list.length > 0);
  }, [grouped, search]);

  const toggle = (jobId: number) => {
    const next = new Set(selectedIds);
    if (next.has(jobId)) next.delete(jobId);
    else next.add(jobId);
    setSelectedIds(next);
  };

  const toggleCompanyOpen = (name: string) => {
    const next = new Set(openCompanies);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setOpenCompanies(next);
  };

  const toggleCompanyAll = (list: typeof jobs) => {
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
      to: "/console/resumes/$resumeId/polish",
      params: { resumeId: String(resume.id) },
    });
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          to="/console/resumes/$resumeId"
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
            按公司筛选，多选岗位；修改时会把所选岗位的 JD 注入提示词
          </p>
        </div>
      </header>

      {/* 顶部：搜索 + 已选 + 保存 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="搜索公司 / 岗位 / 地点…"
        />
        <span className="text-sm text-(--sea-ink-soft)">
          已选{" "}
          <span className="font-medium text-(--lagoon-deep)">
            {selectedIds.size}
          </span>{" "}
          个岗位
        </span>
        <span className="text-xs text-(--sea-ink-soft)">（不选即为空）</span>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="btn-gradient ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-5 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {selectedIds.size === 0
            ? "保存（空）"
            : `保存并去修改（${selectedIds.size}）`}
        </button>
      </div>

      {filtered.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <Target className="mx-auto mb-3 size-10 text-(--sea-ink-soft)" />
          <p className="text-sm text-(--sea-ink-soft)">未找到匹配岗位</p>
        </section>
      ) : (
        /* 筛选标签：按公司分组的可折叠标签组（默认折叠） */
        <div className="island-shell rounded-2xl">
          {filtered.map(([name, list], idx) => {
            const open = openCompanies.has(name);
            const sel = list.filter((j) => selectedIds.has(j.id)).length;
            const allSelected = list.length > 0 && sel === list.length;
            const someSelected = sel > 0 && !allSelected;
            return (
              <div
                key={name}
                className={`${idx > 0 ? "border-t border-(--line)" : ""}`}
              >
                {/* 组头：公司名 + 已选 + 全选/清除 + 折叠箭头 */}
                <button
                  type="button"
                  onClick={() => toggleCompanyOpen(name)}
                  className="flex w-full items-center gap-2 px-5 py-3 text-left transition hover:bg-(--link-bg-hover)"
                >
                  <span
                    className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-sm font-medium transition ${
                      allSelected
                        ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
                        : someSelected
                          ? "border-(--lagoon-deep)/60 text-(--lagoon-deep)"
                          : "border-input text-(--sea-ink)"
                    }`}
                  >
                    {name}
                  </span>
                  <span className="shrink-0 text-xs text-(--sea-ink-soft)">
                    {sel > 0
                      ? `已选 ${sel}/${list.length}`
                      : `${list.length} 个岗位`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompanyAll(list);
                    }}
                    className="ml-auto inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-accent"
                  >
                    {allSelected ? "清除" : "全选"}
                  </button>
                  <span className="shrink-0 text-(--sea-ink-soft)">
                    {open ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </span>
                </button>

                {/* 展开后的岗位标签（可多选） */}
                {open && (
                  <div className="border-t border-(--line) px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {list.map((job) => {
                        const isOn = selectedIds.has(job.id);
                        return (
                          <button
                            type="button"
                            key={job.id}
                            onClick={() => toggle(job.id)}
                            title={`${job.company?.name ?? name} · ${job.title}${
                              job.jobCities?.length
                                ? ` · ${job.jobCities
                                    .map((c) => c.city)
                                    .join("/")}`
                                : ""
                            }`}
                            className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-2 pr-3 text-sm transition ${
                              isOn
                                ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
                                : "border-input bg-(--surface-strong) text-(--sea-ink) hover:border-(--lagoon-deep)"
                            }`}
                          >
                            <span
                              className={`flex size-4 shrink-0 items-center justify-center rounded border text-white ${
                                isOn
                                  ? "border-(--lagoon-deep) bg-(--lagoon-deep)"
                                  : "border-input"
                              }`}
                            >
                              {isOn && <span className="text-[10px]">✓</span>}
                            </span>
                            {job.title}
                            <span className="text-xs text-(--sea-ink-soft)">
                              {job.company?.name ?? name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-(--sea-ink-soft)">
        提示：可多选岗位，也可不选（默认不选）。不选时直接保存，AI
        修改将不参考特定 JD。
      </p>
    </main>
  );
}

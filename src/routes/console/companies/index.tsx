import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { listCompanies } from "#/lib/company-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/companies/")({
  component: CompaniesPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async () => {
    const companies = await listCompanies();
    return { companies };
  },
});

type FetchStatus = {
  name: string;
  ats: string;
  status: string;
  lastFetchedAt: string | null;
};

function CompaniesPage() {
  const { companies } = Route.useLoaderData();
  const [statuses, setStatuses] = useState<FetchStatus[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");

  const loadStatus = async () => {
    const res = await fetch("/api/fetch-jobs");
    if (res.ok) setStatuses((await res.json()) as FetchStatus[]);
  };

  const handleFetchAll = async () => {
    setFetching(true);
    setFetchMsg("");
    const res = await fetch("/api/fetch-jobs", { method: "POST" });
    if (res.ok) {
      const results = (await res.json()) as {
        source: string;
        ok: boolean;
        count: number;
        error?: string;
      }[];
      const okCount = results.filter((r) => r.ok).length;
      const added = results.reduce((s, r) => s + r.count, 0);
      setFetchMsg(
        `完成：${okCount}/${results.length} 个源成功，新增 ${added} 个岗位`,
      );
    } else {
      setFetchMsg("抓取失败，请稍后重试");
    }
    setFetching(false);
    await loadStatus();
    window.location.reload();
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker mb-1">招聘简章</p>
          <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
            AI 公司与岗位汇聚
          </h1>
          <p className="mt-1 text-sm text-(--sea-ink-soft)">
            浏览各家 AI 公司的在招岗位，选择目标岗位后结合 JD 修改简历
          </p>
        </div>
        <Link
          to="/console/companies/new"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink) transition hover:bg-accent"
        >
          <Briefcase className="size-4" />
          手动添加岗位
        </Link>
      </header>

      {companies.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <Briefcase className="mx-auto mb-3 size-10 text-(--sea-ink-soft)" />
          <p className="text-sm text-(--sea-ink-soft)">
            还没有公司数据，点击下方「一键抓取
            JD」从各家公司官网拉取，或手动添加
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to="/console/companies/$companyId"
              params={{ companyId: String(company.id) }}
              className="island-shell group rounded-2xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-(--sea-ink)">
                  {company.name}
                </h2>
                <span className="inline-flex h-6 items-center rounded-full bg-(--chip-bg) px-2.5 text-xs font-medium text-(--lagoon-deep)">
                  {company.jobCount} 个岗位
                </span>
              </div>
              {company.intro ? (
                <p className="mb-4 line-clamp-2 text-sm text-(--sea-ink-soft)">
                  {company.intro}
                </p>
              ) : (
                <p className="mb-4 text-sm text-(--sea-ink-soft)">暂无简介</p>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-medium text-(--lagoon-deep) opacity-0 transition group-hover:opacity-100">
                查看岗位 <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      <section className="island-shell mt-10 rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-(--sea-ink)">
              JD 自动抓取
            </h2>
            <p className="mt-0.5 text-sm text-(--sea-ink-soft)">
              从各家公司官网（Greenhouse / Lever / Ashby）同步岗位，Boss
              直聘需在 .env.local 配置 BOSS_COOKIE
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleFetchAll()}
            disabled={fetching}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-(--lagoon-deep) px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {fetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            一键抓取 JD
          </button>
        </div>

        {fetchMsg && (
          <p className="mb-3 rounded-md bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink)">
            {fetchMsg}
          </p>
        )}

        {statuses && (
          <div className="grid gap-2 sm:grid-cols-2">
            {statuses.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-2 rounded-lg border border-(--line) px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-(--sea-ink)">
                  {s.name}
                </span>
                <span
                  className={`shrink-0 text-xs ${
                    s.status === "idle"
                      ? "text-(--sea-ink-soft)"
                      : s.status.startsWith("success")
                        ? "text-(--lagoon-deep)"
                        : "text-red-500"
                  }`}
                >
                  {s.status === "idle" ? "未抓取" : s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

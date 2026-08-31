import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Briefcase } from "lucide-react";

import LogoAvatar from "#/components/LogoAvatar";
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

function CompaniesPage() {
  const { companies } = Route.useLoaderData();

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
            还没有公司数据，后台将自动抓取各家公司官网岗位，或手动添加
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
              <div className="mb-3 flex items-center gap-2.5">
                <LogoAvatar
                  icon={company.logo ?? undefined}
                  name={company.name}
                  className="size-9"
                />
                <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-(--sea-ink)">
                  {company.name}
                </h2>
                <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-(--chip-bg) px-2.5 text-xs font-medium text-(--lagoon-deep)">
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
    </main>
  );
}

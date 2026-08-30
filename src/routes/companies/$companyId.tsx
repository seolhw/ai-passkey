import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, MapPin, Wallet } from "lucide-react";
import { useState } from "react";

import { getCompanyJobs } from "#/lib/company-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/companies/$companyId")({
  component: CompanyDetailPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ to: "/login" });
  },
  loader: async ({ params }) => {
    const data = await getCompanyJobs({
      data: { companyId: Number(params.companyId) },
    });
    if (!data) throw redirect({ to: "/companies" });
    return data;
  },
});

function CompanyDetailPage() {
  const { company, jobs } = Route.useLoaderData();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8">
        <Link
          to="/companies"
          className="mb-4 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-[var(--sea-ink-soft)] transition hover:bg-accent"
        >
          返回公司列表
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="island-kicker mb-1">招聘简章</p>
            <h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
              {company.name}
            </h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--lagoon-deep)] no-underline hover:underline"
              >
                {company.website} <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
        {company.intro && (
          <p className="mt-3 max-w-2xl text-sm text-[var(--sea-ink-soft)]">
            {company.intro}
          </p>
        )}
      </header>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--sea-ink)]">
          在招岗位（{jobs.length}）
        </h2>
        <Link
          to="/resumes"
          className="text-sm font-medium text-[var(--lagoon-deep)] no-underline hover:underline"
        >
          去选择目标岗位 →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            暂无岗位，试试一键抓取 JD
          </p>
        </section>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => {
            const isOpen = expanded.has(job.id);
            return (
              <section
                key={job.id}
                className="island-shell rounded-2xl p-4 transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(job.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                      {job.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--sea-ink-soft)]">
                      {job.salary && (
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="size-3.5" /> {job.salary}
                        </span>
                      )}
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {job.location}
                        </span>
                      )}
                      <span className="inline-flex h-4.5 items-center rounded-full bg-[var(--chip-bg)] px-2 text-[11px]">
                        {job.source}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 shrink-0 text-[var(--sea-ink-soft)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-4 border-t border-[var(--line)] pt-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--sea-ink)]">
                      {job.jd || "暂无 JD 详情"}
                    </p>
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--lagoon-deep)] no-underline hover:underline"
                      >
                        查看原始招聘页 <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

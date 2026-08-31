import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import DetailModal from "#/components/DetailModal";

import LogoAvatar from "#/components/LogoAvatar";
import { getCompanyJobs } from "#/lib/company-api";
import { formatPublishedAt, formatSalary, JOB_TYPE_LABEL } from "#/lib/job";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/companies/$companyId")({
  component: CompanyDetailPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async ({ params }) => {
    const data = await getCompanyJobs({
      data: { companyId: Number(params.companyId) },
    });
    if (!data) throw redirect({ to: "/console/companies" });
    return data;
  },
});

function CompanyDetailPage() {
  const { company, jobs } = Route.useLoaderData();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  /** 当前查看详情的岗位（null=未打开弹窗） */
  const [viewing, setViewing] = useState<(typeof jobs)[number] | null>(null);

  const toggle = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };
  const openDetail = (job: (typeof jobs)[number]) => setViewing(job);
  const closeDetail = () => setViewing(null);

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8">
        <Link
          to="/console/companies"
          className="mb-4 inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
        >
          返回公司列表
        </Link>
        <div className="flex items-center gap-3">
          <LogoAvatar
            icon={company.logo ?? undefined}
            name={company.name}
            className="size-12"
          />
          <div>
            <p className="island-kicker mb-1">招聘简章</p>
            <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
              {company.name}
            </h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-(--lagoon-deep) no-underline hover:underline"
              >
                {company.website} <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
        {company.intro && (
          <p className="mt-3 max-w-2xl text-sm text-(--sea-ink-soft)">
            {company.intro}
          </p>
        )}
      </header>

      {company.models.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold text-(--sea-ink)">
            模型团队
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.models.map((model) => (
              <span
                key={model.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--surface-strong) py-1 pl-1 pr-3 text-sm text-(--sea-ink)"
              >
                <LogoAvatar
                  icon={model.logo}
                  name={model.name}
                  className="size-6"
                />
                {model.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-(--sea-ink)">
          在招岗位（{jobs.length}）
        </h2>
      </div>

      {jobs.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <p className="text-sm text-(--sea-ink-soft)">
            暂无岗位，后台将自动抓取
          </p>
        </section>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const isOpen = expanded.has(job.id);
            return (
              <div
                key={job.id}
                className={`library-paper relative w-full rounded-[3px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_14px_34px_-14px_rgba(15,23,42,0.28)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_22px_44px_-14px_rgba(15,23,42,0.35)] dark:border-zinc-600 ${
                  isOpen
                    ? "max-h-[75vh] overflow-y-auto overflow-x-hidden"
                    : "aspect-[210/297] overflow-hidden"
                }`}
              >
                {/* 顶部操作条：详情 / 展开全文 */}
                <div className="sticky top-2 z-10 flex justify-end gap-2 px-2 pt-2">
                  <button
                    type="button"
                    onClick={() => openDetail(job)}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-(--lagoon-deep) px-2.5 text-xs font-medium text-white backdrop-blur transition hover:opacity-90"
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(job.id)}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                  >
                    {isOpen ? (
                      <><EyeOff className="size-3.5" /> 收起</>
                    ) : (
                      <><Eye className="size-3.5" /> 展开全文</>
                    )}
                    <ChevronDown
                      className={`size-3.5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* 白纸内容 */}
                <div className="library-paper-content library-paper-job px-8 py-6" style={{ fontSize: "14px" }}>
                  <h1>{job.title}</h1>
                  <div className="library-paper-job-meta">
                    {(job.salaryMin != null || job.salaryMax != null) && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="size-3.5" />{" "}
                        <strong>{formatSalary(job)}</strong>
                      </span>
                    )}
                    {job.jobCities?.length ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {job.jobCities.map((c) => c.city).join(" / ")}
                      </span>
                    ) : null}
                    {job.jobType && (
                      <span>{JOB_TYPE_LABEL[job.jobType] ?? job.jobType}</span>
                    )}
                    {job.experience && <span>{job.experience}</span>}
                    {job.education && <span>{job.education}</span>}
                    {formatPublishedAt(job.publishedAt) && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatPublishedAt(job.publishedAt)} 发布
                      </span>
                    )}
                  </div>

                  <div className="library-paper-job-jd">
                    {isOpen && <h2>职位描述</h2>}
                    <p className="whitespace-pre-wrap">
                      {job.jd || "暂无 JD 详情"}
                    </p>
                    {isOpen && job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm"
                      >
                        查看原始招聘页 <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 底部渐变提示（仅折叠态） */}
                {!isOpen && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/55 to-white" />
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* 招聘详情弹窗 */}
      <DetailModal
        open={viewing != null}
        onClose={closeDetail}
        title={viewing ? `${company.name} · ${viewing.title}` : "岗位详情"}
      >
        {viewing && (
          <div className="mx-auto w-full max-w-[780px]">
            <div className="library-paper min-h-[297mm] overflow-hidden rounded-[2px] border border-zinc-200 bg-white shadow-sm">
              <div className="p-8">
              <div className="library-paper-content" style={{ fontSize: "14px" }}>
                <h1>{viewing.title}</h1>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {(viewing.salaryMin != null || viewing.salaryMax != null) && (<span className="inline-flex items-center gap-1"><Wallet className="size-3.5" /> <strong>{formatSalary(viewing)}</strong></span>)}
                  {viewing.jobCities?.length ? (<span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{viewing.jobCities.map((cn) => cn.city).join(" / ")}</span>) : null}
                  {viewing.jobType && <span>{JOB_TYPE_LABEL[viewing.jobType] ?? viewing.jobType}</span>}
                  {viewing.experience && <span>{viewing.experience}</span>}
                  {viewing.education && <span>{viewing.education}</span>}
                </div>
                <div className="mt-4 border-t border-zinc-200 pt-3">
                  <h2>职位描述</h2>
                  <p className="whitespace-pre-wrap">{viewing.jd || "暂无 JD 详情"}</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>

    </main>
  );
}

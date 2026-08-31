import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";

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

/** A4 纸内容字号放大倍率（按档位） */
const ZOOM_STEPS = [1, 1.3, 1.6];

function CompanyDetailPage() {
  const { company, jobs } = Route.useLoaderData();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  /** 放大弹窗当前展示的岗位（null=未打开） */
  const [viewingJob, setViewingJob] = useState<(typeof jobs)[number] | null>(
    null,
  );
  /** 弹窗内字号档位：0=标准 / 1=大 / 2=特大 */
  const [modalZoom, setModalZoom] = useState(0);

  const toggle = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const openZoom = (job: (typeof jobs)[number]) => {
    setViewingJob(job);
    setModalZoom(0);
  };
  const closeZoom = () => setViewingJob(null);

  const zoomUp = () =>
    setModalZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1));
  const zoomDown = () => setModalZoom((z) => Math.max(0, z - 1));

  const modalJob = viewingJob;
  const modalZoomScale = ZOOM_STEPS[modalZoom] ?? 1;

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
        <Link
          to="/console/resumes"
          className="text-sm font-medium text-(--lagoon-deep) no-underline hover:underline"
        >
          去选择目标岗位 →
        </Link>
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
                {/* 顶部操作条：放大 / 展开全文 / 收起 */}
                <div className="sticky top-2 z-10 flex justify-end gap-2 px-2 pt-2">
                  <button
                    type="button"
                    onClick={() => openZoom(job)}
                    title="放大查看完整 JD"
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                  >
                    <Maximize2 className="size-3.5" /> 放大
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(job.id)}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                  >
                    {isOpen ? (
                      <>
                        <EyeOff className="size-3.5" /> 收起
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" /> 展开全文
                      </>
                    )}
                    <ChevronDown
                      className={`size-3.5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* 白纸内容 */}
                <div className="library-paper-content library-paper-job px-8 py-6">
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

      {/* 放大弹窗：A4 纸展示 JD，内置字号放大/缩小 */}
      <Dialog.Root open={modalJob != null} onOpenChange={(v) => !v && closeZoom()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex max-h-[92vh] w-[min(92vw,860px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl">
            {/* 弹窗顶栏：字号控制 + 关闭 */}
            <div className="flex items-center justify-between gap-3 border-b border-(--line) bg-(--surface-strong) px-4 py-2.5">
              <Dialog.Title className="truncate text-base font-semibold text-(--sea-ink)">
                {modalJob?.title ?? "岗位详情"}
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

            {/* A4 纸内容区（可滚动） */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-(--sea-ink)/5 p-4 sm:p-6">
              <Dialog.Description asChild>
                <div className="sr-only">岗位 JD 放大阅读</div>
              </Dialog.Description>
              <div
                className="library-paper mx-auto w-full max-w-[780px] rounded-[3px] border border-zinc-200 bg-white px-10 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_16px_40px_-16px_rgba(15,23,42,0.35)] transition-[font-size] dark:border-zinc-600"
                style={{ fontSize: `${11 * modalZoomScale}px` }}
              >
                <div className="library-paper-content">
                  <h1>{modalJob?.title ?? ""}</h1>
                  {modalJob && (
                    <>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500">
                        {(modalJob.salaryMin != null ||
                          modalJob.salaryMax != null) && (
                          <span className="inline-flex items-center gap-1">
                            <Wallet className="size-3.5" />{" "}
                            <strong>{formatSalary(modalJob)}</strong>
                          </span>
                        )}
                        {modalJob.jobCities?.length ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {modalJob.jobCities.map((c) => c.city).join(" / ")}
                          </span>
                        ) : null}
                        {modalJob.jobType && (
                          <span>
                            {JOB_TYPE_LABEL[modalJob.jobType] ??
                              modalJob.jobType}
                          </span>
                        )}
                        {modalJob.experience && <span>{modalJob.experience}</span>}
                        {modalJob.education && <span>{modalJob.education}</span>}
                        {formatPublishedAt(modalJob.publishedAt) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatPublishedAt(modalJob.publishedAt)} 发布
                          </span>
                        )}
                      </div>
                      <div className="mt-5 border-t border-zinc-200 pt-4">
                        <h2>职位描述</h2>
                        <p className="whitespace-pre-wrap">
                          {modalJob.jd || "暂无 JD 详情"}
                        </p>
                        {modalJob.sourceUrl && (
                          <a
                            href={modalJob.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm"
                          >
                            查看原始招聘页 <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

import type { Job } from "#/db/schema";

/** 岗位类型中文标签 */
export const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "社招",
  intern: "实习",
  campus: "校招",
};

/** 渲染年薪文本：如「30-70 万/年」；未填写时返回「薪资面议」 */
export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax">) {
  const min = job.salaryMin;
  const max = job.salaryMax;
  if (min == null && max == null) return "薪资面议";
  const lo = min ?? max;
  const hi = max ?? min;
  return lo === hi ? `${lo} 万/年` : `${lo}-${hi} 万/年`;
}

/** 渲染发布日期文本：如「2026-08-10」；未填写时返回空串 */
export function formatPublishedAt(value: unknown) {
  if (value == null || value === "") return "";
  const t = new Date(value as string | number | Date);
  if (Number.isNaN(t.getTime())) return "";
  return t.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

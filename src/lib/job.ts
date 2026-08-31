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

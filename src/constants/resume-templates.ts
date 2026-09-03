/**
 * 简历样式模板定义（纯 CSS 表现层，不改动简历内容）。
 * 排版灵感来自 IT 知名人物的真实简历：
 * - jobs   Steve Jobs 1973 手稿简历（极简、稀疏、留白）
 * - gates  Bill Gates 1974 打字机简历（等宽/仿宋、规整板块）
 * - woz    Steve Wozniak 1976 打字机简历（俏皮、个性、趣味标题）
 * - terminal  极客终端风（等宽字体、深色姓名条、$ 提示符）
 */

export type ResumeTemplateId =
  | "classic"
  | "jobs"
  | "gates"
  | "woz"
  | "terminal";

export interface ResumeTemplate {
  id: ResumeTemplateId;
  /** 中文名 */
  name: string;
  /** 一句话说明（排版特征） */
  description: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "经典商务",
    description: "姓名居中 + 联系行，黑色分隔线，稳重通用",
  },
];

/** 默认模板 id */
export const DEFAULT_RESUME_TEMPLATE: ResumeTemplateId = "classic";

export function getResumeTemplate(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}

import { RESUME_TEMPLATES } from "#/constants/resume-templates";

/** 模板预览用的固定示例简历（仅用于展示排版效果，不参与真实内容） */
const SAMPLE_HTML = `
<h1>张三</h1>
<p>13800000000 · zhang.san@email.com · 北京</p>
<h2>个人简介</h2>
<p>3 年 AI 产品经验，专注大模型应用与产品落地。</p>
<h2>工作经历</h2>
<h3>某科技公司 - AI 产品经理（2022 - 至今）</h3>
<ul>
  <li>负责 AI 客服产品规划与落地，客户满意度提升 30%</li>
</ul>
<h2>技能特长</h2>
<ul>
  <li>大模型应用 / 提示词工程 / RAG</li>
</ul>
`;

/**
 * 简历样式模板的迷你预览：按真实 A4 比例缩放的「小简历」，
 * 复用模板 CSS（.resume-template-* + .resume-editor-content），所见即所得。
 */
export default function TemplatePreview({
  templateId,
}: {
  templateId: string;
}) {
  const t =
    RESUME_TEMPLATES.find((x) => x.id === templateId) ?? RESUME_TEMPLATES[0];
  return (
    <div className={`resume-template-${t.id} resume-preview-frame`}>
      <div className="resume-preview-inner">
        <div className="resume-preview-body">
          <div
            className="resume-editor-content"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: 静态示例内容，非用户输入
            dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }}
          />
        </div>
      </div>
    </div>
  );
}

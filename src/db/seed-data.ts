/** 种子数据：主流国内 AI 公司（公司信息以 LLM_LIST 为单一来源；岗位由抓取逻辑获取，不写种子） */
import { LLM_LIST } from "../constants/models";

/** 由 LLM_LIST 派生的公司种子数据（覆盖全部 19 家国内公司） */
export const seed = LLM_LIST.map((item) => ({
  name: item.company,
  intro: item.intro,
  website: item.website,
  careerUrl: item.careerUrl,
  models: item.models,
}));

/** 简历大厅种子数据 */
export const librarySeed = [
  {
    title: "大模型应用工程师 · 通关简历",
    industry: "AI 应用开发",
    tags: "RAG,Agent,大模型,Python",
    featured: true,
    content: `<h1>张明</h1><p><strong>求职意向：大模型应用工程师</strong></p><h2>个人简介</h2><p>3 年后端开发经验，近 1 年专注大模型应用落地，独立完成企业级 RAG 知识库与多 Agent 工作流的从零搭建，熟悉从需求分析到上线运维的全流程。</p><h2>核心技能</h2><ul><li>编程语言：Python（熟练）、Go（熟悉）、TypeScript（熟悉）</li><li>大模型：GPT-4 / Claude / 文心千帆 API 集成，Function Calling、Tool Use 深度实践</li><li>RAG：LangChain / LlamaIndex，向量数据库（Milvus、pgvector），chunking 与重排序优化</li><li>工程能力：Docker、K8s、Redis、PostgreSQL，AWS 与阿里云部署经验</li></ul><h2>工作经历</h2><h3>某电商公司 · 后端工程师（2023.06 - 至今）</h3><ul><li>搭建基于 RAG 的客服知识库系统，支持 10 万+ 文档，回答准确率从 52% 提升至 87%，接待 70% 常见咨询</li><li>设计多 Agent 工作流处理售后工单，自动分类、定位问题、生成解决方案，人工介入率下降 40%</li><li>优化 Token 成本：通过缓存与提示词压缩，单次咨询成本从 0.35 元降至 0.08 元</li></ul><h2>项目经历</h2><h3>企业智能文档助手（个人项目）</h3><ul><li>基于 LangChain + 通义千问构建，支持 PDF/Word 解析、混合检索（BM25 + 向量）、引用溯源</li><li>设计滑动窗口 chunking 与 Rerank 策略，MRR@10 提升 18%</li></ul><h2>教育背景</h2><p>XX 大学 · 计算机科学与技术 · 本科（2017 - 2021）</p>`,
  },
  {
    title: "AI 产品经理 · 通关简历",
    industry: "AI 产品",
    tags: "产品经理,AI,数据分析",
    featured: true,
    content: `<h1>李婷</h1><p><strong>求职意向：AI 产品经理</strong></p><h2>个人简介</h2><p>5 年互联网产品经验，2 年 AI 产品经验，主导过 3 款 AI 产品从 0 到 1，擅长将大模型能力转化为可量化的业务价值。</p><h2>核心能力</h2><ul><li>产品规划：需求分析、PRD、原型设计、埋点方案与数据验证</li><li>AI 认知：理解 LLM 能力边界与评测方法，能设计 Prompt 评估集与回归用例</li><li>工具：Figma、SQL、Python（数据分析）、Postman</li></ul><h2>工作经历</h2><h3>某 SaaS 公司 · AI 产品经理（2023.03 - 至今）</h3><ul><li>主导「智能助手」产品：覆盖 20+ 场景，月活 15 万，付费转化率提升 23%</li><li>建立 Prompt 效果评估体系（准确率/幻觉率/延迟），驱动迭代 12 个版本</li><li>协同算法团队设计 RAG 召回策略，FAQ 命中率从 60% 提升至 85%</li></ul><h2>项目经历</h2><h3>AI 简历助手（业余项目）</h3><ul><li>定义产品闭环：上传 → 解析 → 修改 → 导出，3 周冷启动 2000 用户</li></ul><h2>教育背景</h2><p>XX 大学 · 信息管理 · 本科（2014 - 2018）</p>`,
  },
  {
    title: "机器学习工程师 · 通关简历",
    industry: "ML 工程",
    tags: "PyTorch,分布式,推理优化",
    featured: false,
    content: `<h1>王强</h1><p><strong>求职意向：机器学习工程师</strong></p><h2>个人简介</h2><p>4 年深度学习工程经验，熟悉大模型分布式训练与推理优化，主导过千卡级训练任务与生产级推理服务的性能调优。</p><h2>核心技能</h2><ul><li>框架：PyTorch、JAX、Megatron-LM、DeepSpeed</li><li>推理优化：vLLM、TensorRT、量化（INT8/FP8）、KV Cache 优化</li><li>基础设施：K8s、GPU 调度（Volcano）、监控（Prometheus/Grafana）、MLFlow</li></ul><h2>工作经历</h2><h3>某 AI 公司 · 机器学习工程师（2022.01 - 至今）</h3><ul><li>负责 70B 模型分布式训练：数据并行 + 张量并行 + ZeRO-3，MFU 达 42%</li><li>上线 vLLM 推理服务：吞吐提升 3.2 倍，P99 延迟 < 300ms，成本下降 55%</li><li>搭建训练监控体系，训练中断率从 15% 降至 2%</li></ul><h2>项目经历</h2><h3>大模型推理压测平台（开源）</h3><ul><li>支持吞吐/延迟/显存多维指标，被 5 家公司采用</li></ul><h2>教育背景</h2><p>XX 大学 · 软件工程 · 硕士（2018 - 2021）</p>`,
  },
];

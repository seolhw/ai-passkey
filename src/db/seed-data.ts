/** 种子数据：主流国内 AI 公司（公司信息以 LLM_LIST 为单一来源；岗位由抓取逻辑获取，不写种子） */
import { LLM_LIST } from "../constants/models";

/** 由 LLM_LIST 派生的公司种子数据（覆盖全部 19 家国内公司） */
export const seed = LLM_LIST.map((item) => ({
  name: item.company,
  logo: item.logo,
  sort: item.sort,
  intro: item.intro,
  website: item.website,
  careerUrl: item.careerUrl,
  models: item.models,
}));

/**
 * 简历大厅种子数据
 * 说明：所有范本均为「化名 + 占位公司 + 示例经历」的虚拟简历，用于向求职者展示如何通过 AI 大厂初筛。
 * 内容结构参考公开简历写作指南与开源简历模板（如 resumejob/awesome-resume、LLM-Resume-Template、
 * AgentGuide 的简历指南等）的量化表达方式，不指向任何真实个人，可安全在简历大厅展示与复制编辑。
 */
export const librarySeed = [
  {
    title: "大模型算法研究员",
    industry: "AI 算法",
    tags: "LLM,预训练,SFT,评测",
    featured: true,
    content: `<h1>陈昊</h1><p><strong>求职意向：大模型算法研究员（LLM）</strong></p><h2>个人简介</h2><p>两年制算法研究+落地经验，硕士方向为大模型，熟悉预训练、SFT、RLHF 与模型评测全链路，在数据集构建与对齐方案上有可复现的方法论。</p><h2>核心技能</h2><ul><li>框架：PyTorch、HuggingFace Transformers/TRL、DeepSpeed</li><li>方法：LoRA/QLoRA、DPO/PPO、RAG、长文本扩展（RoPE/上下文外推）</li><li>评测：OpenCompass、CEval、自建任务集，指标拆解与错误分析</li><li>语言：Python（熟练）、C++（熟悉）、SQL（熟练）</li></ul><h2>工作经历</h2><h3>某 AI Lab · 算法研究员（2023.07 - 至今）</h3><ul><li>负责 3B 模型对齐：设计偏好数据清洗与 DPO 流程，指令遵循率从 61% 提升至 85%</li><li>构建业务评测集 1200 条（推理/写作/工具调用），自动化回归避免 30+ 次退化上线</li><li>主导数据清洗与配比实验：精调后保留率提升 22%，训练成本下降 4 倍</li></ul><h2>项目经历</h2><h3>长文本索引压缩（科研项目）</h3><ul><li>基于 RoPE 位置编码改进外推方案，128K 输入困惑度下降 17%</li></ul><h2>教育背景</h2><p>XX 大学 · 计算机科学与技术 · 硕士（2021 - 2024）</p>`,
  },
  {
    title: "NLP 算法工程师",
    industry: "AI 算法 / NLP",
    tags: "NLP,预训练,LangChain,QA",
    featured: false,
    content: `<h1>刘洋</h1><p><strong>求职意向：NLP 算法工程师</strong></p><h2>个人简介</h2><p>3 年 NLP 算法与工程经验，专注语义理解、检索式问答与生成式应用，参与过从模型选型到在线服务的完整闭环。</p><h2>核心技能</h2><ul><li>模型：BERT 系、T5、LLaMA/Qwen 微调，Sentence-BERT 召回</li><li>NLP：文本分类、NER、意图识别、语义相似度、文本生成与去重</li><li>工具：PyTorch、Elasticsearch、Milvus、LangChain、FastAPI</li></ul><h2>工作经历</h2><h3>某互联网公司 · NLP 算法工程师（2022.05 - 至今）</h3><ul><li>构建语义搜索引擎召回层：Embedding + BM25 混合，召回率提升 28%，线上 A/B 收益 +6.3%</li><li>上线客服意图识别模型：覆盖 60+ 意图，准确率 94%，替代 80% 规则策略</li><li>主导小样本微调方案（LoRA）：标注成本下降 70%，冷启动周期从 3 周缩至 3 天</li></ul><h2>项目经历</h2><h3>企业知识库 QA（内部系统）</h3><ul><li>基于 RAG 的问答系统，支持权限过滤与引用溯源，日均请求 8 万，好评率 91%</li></ul><h2>教育背景</h2><p>XX 大学 · 计算机技术 · 硕士（2019 - 2022）</p>`,
  },
  {
    title: "多模态算法工程师",
    industry: "AI 算法 / 多模态",
    tags: "CV,CLIP,MM-LLM,数据闭环",
    featured: false,
    content: `<h1>赵阳</h1><p><strong>求职意向：多模态算法工程师</strong></p><h2>个人简介</h2><p>4 年视觉算法 + 多模态落地经验，熟练跨图文/视频理解与生成，主导过数据采集、模型训练到线上评测的完整数据闭环。</p><h2>核心技能</h2><ul><li>视觉：目标检测、图像检索、CLIP/BLIP 多模态对齐、图文/视频理解</li><li>生成：Diffusion 模型、可控生成（ControlNet）、视频抽帧/标签管线</li><li>工程：PyTorch、ONNX/TensorRT 部署、分布式训练（DDP/DeepSpeed）</li></ul><h2>工作经历</h2><h3>某智能硬件公司 · 多模态算法工程师（2021.08 - 至今）</h3><ul><li>搭建图文跨模态检索服务：支持 500 万图库实时召回，mAP@10 提升 15%</li><li>主导视频理解管线（抽帧+OCR+标签）：处理 20 万+/天视频，标签准确率 88%</li><li>落地可控图像生成用于素材生产：生成量占比 30%，素材成本下降 45%</li></ul><h2>项目经历</h2><h3>多模态问答 Demo（开源）</h3><ul><li>基于 Qwen-VL 微调少样本图文问答，GitHub 200+ Star</li></ul><h2>教育背景</h2><p>XX 大学 · 模式识别与智能系统 · 硕士（2018 - 2021）</p>`,
  },
  {
    title: "推荐算法工程师",
    industry: "AI 算法 / 推荐",
    tags: "推荐系统,CTR,个性化",
    featured: false,
    content: `<h1>孙悦</h1><p><strong>求职意向：推荐算法工程师</strong></p><h2>个人简介</h2><p>3 年推荐系统经验，熟悉召回、粗排、精排、重排全链路，专注 CTR/CVR 预估与大模型在推荐侧的落地。</p><h2>核心技能</h2><ul><li>模型：DeepFM、DIN、MMoE、Transformer/Llama 微调做序列建模</li><li>特征：特征工程、Embedding、实时特征平台、样本回流与负采样</li><li>工程：Spark/Flink、XGBoost、PyTorch、LibSVM、A/B 实验体系</li></ul><h2>工作经历</h2><h3>某内容平台 · 推荐算法工程师（2022.03 - 至今）</h3><ul><li>优化精排 CTR 模型：引入多目标（时长/点赞/关注）与 MMoE，CTR +4.8%，人均时长 +3.2%</li><li>搭建冷启动特征：新内容曝光 7 天点击率提升 19%，缓解马太效应</li><li>落地 LLM 语义重排：基于向量召回的 Hard Items 二次排序，Top@K 多样性 +12%</li></ul><h2>项目经历</h2><h3>基于 LLM 的兴趣摘要（内部）</h3><ul><li>用大模型生成用户兴趣画像注入排序特征，线上实验 GMV +1.7%</li></ul><h2>教育背景</h2><p>XX 大学 · 应用统计 · 硕士（2019 - 2022）</p>`,
  },
  {
    title: "AI 后端工程师",
    industry: "AI 工程",
    tags: "Go,微服务,推理服务,高并发",
    featured: true,
    content: `<h1>周浩</h1><p><strong>求职意向：AI 后端工程师</strong></p><h2>个人简介</h2><p>4 年高并发后端经验，近 2 年专注 AI 服务平台建设，主导过大模型网关、推理服务编排与成本控制，擅长把算法模型变成稳定可靠的线上能力。</p><h2>核心技能</h2><ul><li>语言：Go（熟练）、Python（熟练）、Java（熟悉）</li><li>服务：gRPC、Nginx、消息队列（Kafka/RabbitMQ）、Consul/etcd</li><li>AI 工程：模型网关、Prompt 管理、限流/熔断/兜底、vLLM 接入与并发控制</li><li>存储：MySQL、Redis、MongoDB、Milvus，Docker/K8s 部署</li></ul><h2>工作经历</h2><h3>某 AI 创业公司 · 后端工程师（2022.04 - 至今）</h3><ul><li>设计大模型统一网关：串联 20+ 模型供应商，支持路由/重试/降级，月度调用 $50K+</li><li>实现推理服务弹性扩缩容（基于请求队列与 GPU 水位），单实例吞吐提升 3.5 倍</li><li>搭建权限与计量系统：支持租户限流、配额、账单，故障率控制在 99.95% 可用</li></ul><h2>项目经历</h2><h3>LLM 服务压测工具（开源）</h3><ul><li>支持流式/并发/长文本场景，被团队作为上线的标准回归手段</li></ul><h2>教育背景</h2><p>XX 大学 · 软件工程 · 本科（2018 - 2022）</p>`,
  },
  {
    title: "AI 前端工程师",
    industry: "AI 应用",
    tags: "React,流式交互,前端工程,LLM",
    featured: true,
    content: `<h1>吴倩</h1><p><strong>求职意向：AI 前端工程师</strong></p><h2>个人简介</h2><p>3 年前端经验，专注 AI 对话与流式交互体验，擅长将大模型能力转化为流畅、可用的产品界面，熟悉链路追踪与端到端性能优化。</p><h2>核心技能</h2><ul><li>框架：React、TypeScript、Next.js、Vite，Tailwind/组件库搭建</li><li>AI 交互：SSE/WebSocket 流式渲染、Markdown/富文本渲染、撤回/中止/重试机制</li><li>工程化：Monorepo、CI/CD、性能监控（LCP/INP）、错误上报与回放</li></ul><h2>工作经历</h2><h3>某 AI 应用公司 · 前端工程师（2022.07 - 至今）</h3><ul><li>实现对话流式渲染首字符 &lt; 200ms，令牌平滑输出，用户放弃率下降 25%</li><li>抽象 Prompt 编辑器与多模型切换组件，支撑 5 条产品线的复用</li><li>搭建前端监控与 AI 错误兜底：生成失败自动降级为规则回复，人工退回量减半</li></ul><h2>项目经历</h2><h3>Web 版 AI 助手（内部）</h3><ul><li>负责从 0 搭建，支持多会话/文件上传/引用溯源，周活 7000+</li></ul><h2>教育背景</h2><p>XX 大学 · 数字媒体技术 · 本科（2019 - 2023）</p>`,
  },
  {
    title: "强化学习算法工程师",
    industry: "AI 算法 / RL",
    tags: "强化学习,RLHF,PPO,智能体",
    featured: false,
    content: `<h1>郑凯</h1><p><strong>求职意向：强化学习算法工程师</strong></p><h2>个人简介</h2><p>3 年强化学习研究与落地经验，专精 RLHF 与智能体决策，成功将 PPO/DRL 方案应用到对话对齐与调度优化，具备从仿真到实机的调参复现能力。</p><h2>核心技能</h2><ul><li>方法：PPO/DPO/GRPO、RLHF、reward modeling、分层 RL、模仿学习</li><li>框架：PyTorch、Ray、Stable-Baselines3、TRL/OpenRLHF</li><li>场景：对话对齐、工具调用智能体、调度/推荐序贯决策</li></ul><h2>工作经历</h2><h3>某 AI 公司 · 强化学习算法工程师（2022.09 - 至今）</h3><ul><li>实现 PPO 对齐流程：训练 7B 模型，Reward 均值提升 0.42，评估集 pass@1 提升 11%</li><li>构建 reward model：融入可验证规则与人工偏好，胜率一致率 82%，防 reward hacking</li><li>落地工具调用智能体：多轮规划 + 自纠错，任务完成率从 58% 提升至 79%</li></ul><h2>项目经历</h2><h3>GridWorld 调度优化（科研）</h3><ul><li>用 DQN/PPO 解车间调度，与启发式对比节拍时间提升 9%</li></ul><h2>教育背景</h2><p>XX 大学 · 人工智能 · 硕士（2020 - 2023）</p>`,
  },
  {
    title: "数据科学工程师",
    industry: "数据科学",
    tags: "特征工程,SQL,AB测试,AI",
    featured: false,
    content: `<h1>何雨</h1><p><strong>求职意向：数据科学工程师</strong></p><h2>个人简介</h2><p>3 年数据科学经验，擅长将海量数据转化为可落地的模型与决策依据，覆盖特征工程、实验设计与模型上线，近期专注 AI 在业务指标预测中的应用。</p><h2>核心技能</h2><ul><li>分析：SQL（熟练）、Python（pandas/NumPy/scikit-learn）、Spark</li><li>建模：XGBoost/LightGBM、因果推断（DID/PSM）、A/B 实验设计</li><li>工具：Airflow、Tableau、dbt、Git + CI，MongoDB/ClickHouse</li></ul><h2>工作经历</h2><h3>某金融科技公司 · 数据科学工程师（2022.06 - 至今）</h3><ul><li>监控 A/B 实验体系，覆盖 200+ 并行实验，搭建显著性预警，减少误判 30%</li><li>构建流失预警模型：AUC 0.87，提前 7 天识别高流失用户，挽留活动 ROI 提升 2.4 倍</li><li>引入 LLM 摘要生成运营周报：人工整理时间每周缩短 12 小时</li></ul><h2>项目经历</h2><h3>异常流量识别（内部）</h3><ul><li>基于特征工程与 Isolation Forest 识别刷量，召回 92%，拦截成本下降 40%</li></ul><h2>教育背景</h2><p>XX 大学 · 统计学 · 硕士（2019 - 2022）</p>`,
  },
  {
    title: "AI 训练平台工程师",
    industry: "AI 基础设施",
    tags: "K8s,GPU,NCCL,训练平台",
    featured: false,
    content: `<h1>马辰</h1><p><strong>求职意向：AI 训练平台工程师</strong></p><h2>个人简介</h2><p>4 年基础设施经验，专注 GPU 集群调度与训练平台建设，主导过千卡集群的网络调优、资源隔离与故障自愈，把分布式训练跑稳、跑快。</p><h2>核心技能</h2><ul><li>调度：K8s、Volcano、Slurm、GPU 共享（MIG/时间片）</li><li>网络与库：NCCL、RoCE、RDMA，网络拓扑感知调度</li><li>工具：Prometheus/Grafana、检查点（Checkpoint）加速、训练监控</li></ul><h2>工作经历</h2><h3>某 AI 云厂商 · 训练平台工程师（2021.10 - 至今）</h3><ul><li>建设千卡 GPU 调度平台：配额管理 + 排队策略，集群利用率从 45% 提升至 78%</li><li>调优 NCCL 全互联：通信占比下降 18%，大规模训练时长平均缩短 20%</li><li>实现故障自动检测与任务重调度：训练中断导致的算力浪费减少 60%</li></ul><h2>项目经历</h2><h3>Checkpoint 加速工具（开源）</h3><ul><li>异步去重落盘，Checkpoint 写入时间从 5 分钟降至 40 秒</li></ul><h2>教育背景</h2><p>XX 大学 · 计算机系统结构 · 硕士（2018 - 2021）</p>`,
  },
];

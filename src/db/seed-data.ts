/** 种子数据：主流 AI 公司及代表性岗位 JD */
export const seed = [
	{
		name: "OpenAI",
		intro: "致力于确保通用人工智能惠及全人类的研究与部署公司。",
		website: "https://openai.com",
		jobs: [
			{
				title: "AI 研究员（研究科学家）",
				salary: "25万-50万美元/年",
				location: "旧金山（支持远程）",
				jd: "负责推进机器学习前沿研究，包括大模型训练、强化学习、多模态理解。要求：CS/数学/物理博士优先；扎实的深度学习功底；精通 PyTorch/JAX；有顶会论文或大型模型训练经验者优先。",
			},
			{
				title: "机器学习工程师",
				salary: "20万-40万美元/年",
				location: "旧金山 / 远程",
				jd: "构建大规模分布式训练与推理系统。要求：精通 Python、分布式系统；熟悉 GPU 集群调度；了解 Transformer 架构与推理优化（vLLM/TensorRT）；3 年以上相关经验。",
			},
		],
	},
	{
		name: "Anthropic",
		intro: "AI 安全与研究的领先公司，Claude 系列模型开发者。",
		website: "https://www.anthropic.com",
		jobs: [
			{
				title: "提示工程专家",
				salary: "18万-35万美元/年",
				location: "旧金山 / 远程",
				jd: "设计并评估 Claude 模型的高级提示策略。要求：出色的写作与逻辑能力；理解 RLHF 与模型对齐；有实际大模型应用落地经验；具备评估数据构建能力。",
			},
			{
				title: "模型对齐研究员",
				salary: "22万-45万美元/年",
				location: "旧金山",
				jd: "研究模型安全、诚实与有益性对齐方法。要求：机器学习博士或同等研究能力；熟悉 RLHF/DPO；有 AI 安全方向研究经验者优先。",
			},
		],
	},
	{
		name: "字节跳动",
		intro: "抖音、TikTok 母公司，火山引擎提供大模型与 AI 云服务。",
		website: "https://www.bytedance.com",
		jobs: [
			{
				title: "大模型算法工程师（豆包）",
				salary: "40万-100万人民币/年",
				location: "北京 / 上海",
				jd: "负责豆包大模型训练、微调与评测。要求：计算机相关硕士及以上；熟悉 Transformer、训练框架（Megatron/DeepSpeed）；有 LLM 训练或推理优化经验；精通 Python/C++。",
			},
			{
				title: "AI 产品经理",
				salary: "30万-70万人民币/年",
				location: "北京",
				jd: "负责 AI 产品需求分析、原型设计与落地。要求：有 AI 产品或增长产品经验；理解大模型能力边界；数据分析能力强；能与算法团队高效协作。",
			},
		],
	},
	{
		name: "阿里云",
		intro: "阿里旗下云计算与 AI 服务商，通义大模型开发者。",
		website: "https://www.aliyun.com",
		jobs: [
			{
				title: "大模型应用工程师",
				salary: "35万-80万人民币/年",
				location: "杭州 / 北京",
				jd: "基于通义千问构建企业级 AI 应用。要求：熟悉 LLM 应用开发（RAG、Agent、Function Calling）；精通 Python 与主流 Web 框架；有云上部署经验；了解向量数据库。",
			},
			{
				title: "算法工程师（NLP 方向）",
				salary: "35万-90万人民币/年",
				location: "杭州",
				jd: "负责通义千问核心 NLP 算法研发。要求：NLP/机器学习硕士以上；熟悉预训练与微调；有顶会论文或工业落地经验；编程能力扎实。",
			},
		],
	},
	{
		name: "百度",
		intro: "文心一言大模型与自动驾驶等 AI 技术领导者。",
		website: "https://www.baidu.com",
		jobs: [
			{
				title: "文心大模型算法工程师",
				salary: "35万-85万人民币/年",
				location: "北京",
				jd: "参与文心大模型训练与对齐。要求：深度学习基础扎实；熟悉大模型训练框架；有分布式训练经验；熟悉强化学习与 RLHF 者优先。",
			},
			{
				title: "AI 平台研发工程师",
				salary: "30万-70万人民币/年",
				location: "北京",
				jd: "建设大模型训练与推理平台。要求：精通 Go/Python；熟悉 K8s 与云原生；了解 GPU 资源调度；有 ML 平台开发经验者优先。",
			},
		],
	},
	{
		name: "智谱 AI",
		intro: "GLM 大模型开发者，国内领先的大模型创业公司。",
		website: "https://www.zhipuai.cn",
		jobs: [
			{
				title: "大模型训练工程师",
				salary: "40万-100万人民币/年",
				location: "北京",
				jd: "负责 GLM 系列模型训练与优化。要求：熟悉 Megatron/DeepSpeed；精通 PyTorch；理解数据并行/张量并行；有大规模训练经验。",
			},
			{
				title: "AI 解决方案架构师",
				salary: "30万-70万人民币/年",
				location: "北京 / 上海",
				jd: "面向政企客户设计 AI 落地方案。要求：熟悉大模型应用技术栈；有售前或解决方案经验；能写高质量技术方案；沟通表达能力强。",
			},
		],
	},
];

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
		content: `<h1>李婷</h1><p><strong>求职意向：AI 产品经理</strong></p><h2>个人简介</h2><p>5 年互联网产品经验，2 年 AI 产品经验，主导过 3 款 AI 产品从 0 到 1，擅长将大模型能力转化为可量化的业务价值。</p><h2>核心能力</h2><ul><li>产品规划：需求分析、PRD、原型设计、埋点方案与数据验证</li><li>AI 认知：理解 LLM 能力边界与评测方法，能设计 Prompt 评估集与回归用例</li><li>工具：Figma、SQL、Python（数据分析）、Postman</li></ul><h2>工作经历</h2><h3>某 SaaS 公司 · AI 产品经理（2023.03 - 至今）</h3><ul><li>主导「智能助手」产品：覆盖 20+ 场景，月活 15 万，付费转化率提升 23%</li><li>建立 Prompt 效果评估体系（准确率/幻觉率/延迟），驱动迭代 12 个版本</li><li>协同算法团队设计 RAG 召回策略，FAQ 命中率从 60% 提升至 85%</li></ul><h2>项目经历</h2><h3>AI 简历助手（业余项目）</h3><ul><li>定义产品闭环：上传 → 解析 → 润色 → 导出，3 周冷启动 2000 用户</li></ul><h2>教育背景</h2><p>XX 大学 · 信息管理 · 本科（2014 - 2018）</p>`,
	},
	{
		title: "机器学习工程师 · 通关简历",
		industry: "ML 工程",
		tags: "PyTorch,分布式,推理优化",
		featured: false,
		content: `<h1>王强</h1><p><strong>求职意向：机器学习工程师</strong></p><h2>个人简介</h2><p>4 年深度学习工程经验，熟悉大模型分布式训练与推理优化，主导过千卡级训练任务与生产级推理服务的性能调优。</p><h2>核心技能</h2><ul><li>框架：PyTorch、JAX、Megatron-LM、DeepSpeed</li><li>推理优化：vLLM、TensorRT、量化（INT8/FP8）、KV Cache 优化</li><li>基础设施：K8s、GPU 调度（Volcano）、监控（Prometheus/Grafana）、MLFlow</li></ul><h2>工作经历</h2><h3>某 AI 公司 · 机器学习工程师（2022.01 - 至今）</h3><ul><li>负责 70B 模型分布式训练：数据并行 + 张量并行 + ZeRO-3，MFU 达 42%</li><li>上线 vLLM 推理服务：吞吐提升 3.2 倍，P99 延迟 < 300ms，成本下降 55%</li><li>搭建训练监控体系，训练中断率从 15% 降至 2%</li></ul><h2>项目经历</h2><h3>大模型推理压测平台（开源）</h3><ul><li>支持吞吐/延迟/显存多维指标，被 5 家公司采用</li></ul><h2>教育背景</h2><p>XX 大学 · 软件工程 · 硕士（2018 - 2021）</p>`,
	},
];

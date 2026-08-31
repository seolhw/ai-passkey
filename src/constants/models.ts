// ============================================================
// 1. 类型定义
// ============================================================

/** 大模型类型 */
export type ModelType =
  | "general"
  | "industry"
  | "startup"
  | "technical"
  | "terminal";

/** 大模型团队（模型名 + logo + 排序） */
export interface ModelInfo {
  /** 模型/团队名称 */
  name: string;
  /** 图标 id（@lobehub/icons，空表示未收录，渲染时回退首字母徽标） */
  logo: string;
  /** 排序权重（越小越靠前） */
  sort: number;
}

/** 单条大模型公司数据 */
export interface LLMModel {
  /** 公司名称 */
  company: string;
  /** 图标 id（@lobehub/icons，空表示未收录，渲染时回退首字母徽标） */
  logo: string;
  /** 排序权重（越小越靠前，新势力优先） */
  sort: number;
  /** 大模型团队列表 */
  models: ModelInfo[];
  /** 分类类型 */
  type: ModelType;
  /** 核心特点/标签 */
  keyFeature: string;
  /** 公司简介 */
  intro: string;
  /** 官网 */
  website: string;
  /** 官方招聘页面 */
  careerUrl: string;
  /** 是否开源（可选） */
  isOpenSource?: boolean;
}

/** 按类型分组的结果 */
export type GroupedModels = Record<ModelType, LLMModel[]>;

// ============================================================
// 2. 数据定义
// ============================================================

/** 所有大模型公司数据（数组顺序即种子主键顺序，展示排序由 sort 字段驱动） */
export const LLM_LIST: LLMModel[] = [
  // ---------- 通用平台类 ----------
  {
    company: "字节跳动",
    logo: "bytedance",
    sort: 80,
    models: [
      { name: "豆包 (Doubao)", logo: "doubao", sort: 10 },
      { name: "即梦 (Jimeng)", logo: "bytedance", sort: 20 },
    ],
    type: "general",
    keyFeature: "亿级日活，全民级AI助手",
    intro: "抖音、TikTok 母公司，火山引擎提供大模型与 AI 云服务。",
    website: "https://www.bytedance.com",
    careerUrl: "https://jobs.bytedance.com",
  },
  {
    company: "阿里巴巴",
    logo: "alibaba",
    sort: 90,
    models: [
      { name: "通义千问 (Qwen)", logo: "qwen", sort: 10 },
      { name: "通义万相 (Wanxiang)", logo: "qwen", sort: 20 },
    ],
    type: "general",
    keyFeature: "云生态整合，企业级市场领先",
    intro: "阿里旗下云计算与 AI 服务商，通义大模型开发者。",
    website: "https://www.alibaba.com",
    careerUrl: "https://talent.alibaba.com",
    isOpenSource: true,
  },
  {
    company: "百度",
    logo: "baidu",
    sort: 100,
    models: [{ name: "文心一言 (ERNIE)", logo: "baidu", sort: 10 }],
    type: "general",
    keyFeature: "搜索+知识增强",
    intro: "文心一言大模型与自动驾驶等 AI 技术领导者。",
    website: "https://www.baidu.com",
    careerUrl: "https://talent.baidu.com",
  },
  {
    company: "腾讯",
    logo: "tencent",
    sort: 110,
    models: [
      { name: "混元 (Hunyuan)", logo: "hunyuan", sort: 10 },
      { name: "腾讯元宝 (Yuanbao)", logo: "yuanbao", sort: 20 },
    ],
    type: "general",
    keyFeature: "微信生态深度融合",
    intro: "混元大模型深度融入微信生态，覆盖十亿级用户场景。",
    website: "https://www.tencent.com",
    careerUrl: "https://careers.tencent.com",
  },

  // ---------- 行业垂直类 ----------
  {
    company: "华为",
    logo: "huawei",
    sort: 120,
    models: [{ name: "盘古 (Pangu)", logo: "huawei", sort: 10 }],
    type: "industry",
    keyFeature: "政务/煤矿/气象垂直领域",
    intro: "盘古大模型深耕政务、煤矿、气象等垂直行业。",
    website: "https://www.huawei.com",
    careerUrl: "https://career.huawei.com",
  },
  {
    company: "科大讯飞",
    logo: "iflytekcloud",
    sort: 130,
    models: [{ name: "讯飞星火 (Spark)", logo: "spark", sort: 10 }],
    type: "industry",
    keyFeature: "语音AI + 教育/医疗场景",
    intro: "讯飞星火大模型，语音 AI 与教育、医疗场景领先。",
    website: "https://www.iflytek.com",
    careerUrl: "https://job.iflytek.com",
  },
  {
    company: "商汤科技",
    logo: "",
    sort: 160,
    models: [
      { name: "商量 (SenseChat)", logo: "", sort: 10 },
      { name: "日日新 (SenseNova)", logo: "", sort: 20 },
    ],
    type: "industry",
    keyFeature: "计算机视觉 + 智慧城市/金融",
    intro: "计算机视觉领军企业，推出商量与日日新大模型。",
    website: "https://www.sensetime.com",
    careerUrl: "https://www.sensetime.com/career",
  },
  {
    company: "美团",
    logo: "",
    sort: 170,
    models: [{ name: "LongCat", logo: "", sort: 10 }],
    type: "industry",
    keyFeature: "本地生活场景驱动",
    intro: "LongCat 大模型深耕本地生活场景。",
    website: "https://www.meituan.com",
    careerUrl: "https://zhaopin.meituan.com",
  },
  {
    company: "京东",
    logo: "",
    sort: 180,
    models: [{ name: "言犀 (JoyAI)", logo: "", sort: 10 }],
    type: "industry",
    keyFeature: "零售/物流供应链",
    intro: "言犀大模型服务零售与物流供应链。",
    website: "https://www.jd.com",
    careerUrl: "https://zhaopin.jd.com",
  },
  {
    company: "360",
    logo: "ai360",
    sort: 140,
    models: [{ name: "360智脑", logo: "ai360", sort: 10 }],
    type: "industry",
    keyFeature: "搜索 + 安全AI",
    intro: "360 智脑大模型，结合搜索与安全 AI。",
    website: "https://www.360.cn",
    careerUrl: "https://hr.360.cn",
  },

  // ---------- 创业六小虎（新势力，排序靠前） ----------
  {
    company: "智谱AI",
    logo: "zhipu",
    sort: 30,
    models: [
      { name: "GLM系列", logo: "chatglm", sort: 10 },
      { name: "CodeGeeX", logo: "codegeex", sort: 20 },
    ],
    type: "startup",
    keyFeature: "清华系，技术积淀深",
    intro: "GLM 大模型开发者，国内领先的大模型创业公司。",
    website: "https://www.zhipuai.cn",
    careerUrl: "https://www.zhipuai.cn",
    isOpenSource: true,
  },
  {
    company: "MiniMax",
    logo: "minimax",
    sort: 20,
    models: [
      { name: "MiniMax系列", logo: "minimax", sort: 10 },
      { name: "abab", logo: "minimax", sort: 20 },
      { name: "海螺AI (Hailuo)", logo: "hailuo", sort: 30 },
    ],
    type: "startup",
    keyFeature: "全模态（文本/语音/视频）",
    intro: "全模态大模型创业公司，推出海螺 AI 与 abab 系列。",
    website: "https://www.minimax.io",
    careerUrl: "https://www.minimax.io/careers",
  },
  {
    company: "百川智能",
    logo: "baichuan",
    sort: 60,
    models: [{ name: "百川 (Baichuan)", logo: "baichuan", sort: 10 }],
    type: "startup",
    keyFeature: "王小川创立，开源友好",
    intro: "王小川创立，开源友好的大模型创业公司。",
    website: "https://www.baichuan-ai.com",
    careerUrl: "https://www.baichuan-ai.com",
    isOpenSource: true,
  },
  {
    company: "月之暗面",
    logo: "moonshot",
    sort: 40,
    models: [{ name: "Kimi", logo: "kimi", sort: 10 }],
    type: "startup",
    keyFeature: "长文本处理能力突出",
    intro: "Kimi 大模型，长文本处理能力行业领先。",
    website: "https://www.moonshot.cn",
    careerUrl: "https://www.moonshot.cn",
  },
  {
    company: "阶跃星辰",
    logo: "stepfun",
    sort: 50,
    models: [{ name: "Step系列", logo: "stepfun", sort: 10 }],
    type: "startup",
    keyFeature: "通用大模型后起之秀",
    intro: "Step 系列通用大模型，后起之秀。",
    website: "https://www.stepfun.com",
    careerUrl: "https://www.stepfun.com",
  },
  {
    company: "零一万物",
    logo: "",
    sort: 70,
    models: [{ name: "Yi系列", logo: "", sort: 10 }],
    type: "startup",
    keyFeature: "李开复创办，开源模型",
    intro: "李开复创办，开源 Yi 系列大模型。",
    website: "https://www.lingyiwanwu.com",
    careerUrl: "https://www.lingyiwanwu.com",
    isOpenSource: true,
  },

  // ---------- 技术/端侧类 ----------
  {
    company: "深度求索 (DeepSeek)",
    logo: "deepseek",
    sort: 10,
    models: [{ name: "DeepSeek系列", logo: "deepseek", sort: 10 }],
    type: "technical",
    keyFeature: "开源 + 强推理能力，性价比高",
    intro: "DeepSeek 开源大模型，强推理能力与高性价比。",
    website: "https://www.deepseek.com",
    careerUrl: "https://www.deepseek.com",
    isOpenSource: true,
  },
  {
    company: "面壁智能",
    logo: "",
    sort: 190,
    models: [{ name: "MiniCPM系列", logo: "", sort: 10 }],
    type: "technical",
    keyFeature: "端侧大模型（手机/车机/PC）",
    intro: "MiniCPM 端侧大模型，主打手机、车机、PC。",
    website: "https://www.modelbest.cn",
    careerUrl: "https://www.modelbest.cn",
    isOpenSource: true,
  },

  // ---------- 终端融合类 ----------
  {
    company: "小米",
    logo: "xiaomimimo",
    sort: 150,
    models: [{ name: "MiMo", logo: "xiaomimimo", sort: 10 }],
    type: "terminal",
    keyFeature: "智能硬件 + 操作系统深度融合",
    intro: "MiMo 大模型与智能硬件、操作系统深度融合。",
    website: "https://www.mi.com",
    careerUrl: "https://hr.xiaomi.com",
  },
];

// ============================================================
// 3. 辅助工具函数（可选）
// ============================================================

/** 获取所有公司名称 */
export const getCompanyNames = (): string[] =>
  LLM_LIST.map((item) => item.company);

/** 按类型分组 */
export const getGroupedModels = (): GroupedModels => {
  return LLM_LIST.reduce<GroupedModels>((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as GroupedModels);
};

/** 根据公司名称查找模型 */
export const findModelByCompany = (company: string): LLMModel | undefined => {
  return LLM_LIST.find((item) => item.company.includes(company));
};

/** 获取开源模型列表 */
export const getOpenSourceModels = (): LLMModel[] => {
  return LLM_LIST.filter((item) => item.isOpenSource === true);
};

/** 获取指定类型的所有模型 */
export const getModelsByType = (type: ModelType): LLMModel[] => {
  return LLM_LIST.filter((item) => item.type === type);
};

// 首页 Hero 中重点展示的国内 AI 公司（新势力优先）
export const AI_COMPANIES = [
  { name: "DeepSeek", logo: "deepseek" },
  { name: "MiniMax", logo: "minimax" },
  { name: "智谱AI", logo: "zhipu" },
  { name: "月之暗面(Kimi)", logo: "moonshot" },
  { name: "字节(豆包)", logo: "bytedance" },
  { name: "通义千问(Qwen)", logo: "qwen" },
] as const;

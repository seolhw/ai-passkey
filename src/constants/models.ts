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

/** 单条大模型数据 */
export interface LLMModel {
  /** 公司名称 */
  company: string;
  /** 模型名称 */
  model: string;
  /** 分类类型 */
  type: ModelType;
  /** 核心特点/标签 */
  keyFeature: string;
  /** 是否开源（可选） */
  isOpenSource?: boolean;
  /** 推出年份（可选） */
  launchYear?: number;
}

/** 按类型分组的结果 */
export type GroupedModels = Record<ModelType, LLMModel[]>;

// ============================================================
// 2. 数据定义
// ============================================================

/** 所有大模型公司数据 */
export const LLM_LIST: LLMModel[] = [
  // ---------- 通用平台类 ----------
  {
    company: "字节跳动",
    model: "豆包 (Doubao)",
    type: "general",
    keyFeature: "亿级日活，全民级AI助手",
    launchYear: 2023,
  },
  {
    company: "阿里巴巴",
    model: "通义千问 (Qwen)",
    type: "general",
    keyFeature: "云生态整合，企业级市场领先",
    isOpenSource: true,
    launchYear: 2023,
  },
  {
    company: "百度",
    model: "文心一言 (ERNIE)",
    type: "general",
    keyFeature: "搜索+知识增强",
    launchYear: 2023,
  },
  {
    company: "腾讯",
    model: "混元 (Hunyuan)",
    type: "general",
    keyFeature: "微信生态深度融合",
    launchYear: 2023,
  },

  // ---------- 行业垂直类 ----------
  {
    company: "华为",
    model: "盘古 (Pangu)",
    type: "industry",
    keyFeature: "政务/煤矿/气象垂直领域",
    launchYear: 2021,
  },
  {
    company: "科大讯飞",
    model: "讯飞星火 (Spark)",
    type: "industry",
    keyFeature: "语音AI + 教育/医疗场景",
    launchYear: 2023,
  },
  {
    company: "商汤科技",
    model: "商量 (SenseChat)",
    type: "industry",
    keyFeature: "计算机视觉 + 智慧城市/金融",
    launchYear: 2023,
  },
  {
    company: "美团",
    model: "LongCat",
    type: "industry",
    keyFeature: "本地生活场景驱动",
  },
  {
    company: "京东",
    model: "言犀 (JoyAI)",
    type: "industry",
    keyFeature: "零售/物流供应链",
  },
  {
    company: "360",
    model: "360智脑",
    type: "industry",
    keyFeature: "搜索 + 安全AI",
  },

  // ---------- 创业六小虎 ----------
  {
    company: "智谱AI",
    model: "GLM系列",
    type: "startup",
    keyFeature: "清华系，技术积淀深",
    isOpenSource: true,
    launchYear: 2020,
  },
  {
    company: "MiniMax",
    model: "MiniMax系列",
    type: "startup",
    keyFeature: "全模态（文本/语音/视频）",
    launchYear: 2021,
  },
  {
    company: "百川智能",
    model: "百川 (Baichuan)",
    type: "startup",
    keyFeature: "王小川创立，开源友好",
    isOpenSource: true,
    launchYear: 2023,
  },
  {
    company: "月之暗面",
    model: "Kimi",
    type: "startup",
    keyFeature: "长文本处理能力突出",
    launchYear: 2023,
  },
  {
    company: "阶跃星辰",
    model: "Step系列",
    type: "startup",
    keyFeature: "通用大模型后起之秀",
    launchYear: 2023,
  },
  {
    company: "零一万物",
    model: "Yi系列",
    type: "startup",
    keyFeature: "李开复创办，开源模型",
    isOpenSource: true,
    launchYear: 2023,
  },

  // ---------- 技术/端侧类 ----------
  {
    company: "深度求索 (DeepSeek)",
    model: "DeepSeek系列",
    type: "technical",
    keyFeature: "开源 + 强推理能力，性价比高",
    isOpenSource: true,
    launchYear: 2023,
  },
  {
    company: "面壁智能",
    model: "MiniCPM系列",
    type: "technical",
    keyFeature: "端侧大模型（手机/车机/PC）",
    isOpenSource: true,
    launchYear: 2023,
  },

  // ---------- 终端融合类 ----------
  {
    company: "小米",
    model: "MiMo",
    type: "terminal",
    keyFeature: "智能硬件 + 操作系统深度融合",
    launchYear: 2024,
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

// 首页 Hero 中重点展示的国内 AI 公司
export const AI_COMPANIES = [
  "DeepSeek",
  "MiniMax",
  "智谱AI",
  "月之暗面(Kimi)",
  "字节(豆包)",
  "通义千问(Qwen)",
] as const;

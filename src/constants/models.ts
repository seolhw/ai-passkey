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

/** 单条大模型公司数据 */
export interface LLMModel {
  /** 公司名称 */
  company: string;
  /** 大模型团队列表 */
  models: string[];
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

/** 所有大模型公司数据 */
export const LLM_LIST: LLMModel[] = [
  // ---------- 通用平台类 ----------
  {
    company: "字节跳动",
    models: ["豆包 (Doubao)", "即梦 (Jimeng)"],
    type: "general",
    keyFeature: "亿级日活，全民级AI助手",
    intro: "抖音、TikTok 母公司，火山引擎提供大模型与 AI 云服务。",
    website: "https://www.bytedance.com",
    careerUrl: "https://jobs.bytedance.com",
  },
  {
    company: "阿里巴巴",
    models: ["通义千问 (Qwen)", "通义万相 (Wanxiang)"],
    type: "general",
    keyFeature: "云生态整合，企业级市场领先",
    intro: "阿里旗下云计算与 AI 服务商，通义大模型开发者。",
    website: "https://www.alibaba.com",
    careerUrl: "https://talent.alibaba.com",
    isOpenSource: true,
  },
  {
    company: "百度",
    models: ["文心一言 (ERNIE)"],
    type: "general",
    keyFeature: "搜索+知识增强",
    intro: "文心一言大模型与自动驾驶等 AI 技术领导者。",
    website: "https://www.baidu.com",
    careerUrl: "https://talent.baidu.com",
  },
  {
    company: "腾讯",
    models: ["混元 (Hunyuan)", "腾讯元宝 (Yuanbao)"],
    type: "general",
    keyFeature: "微信生态深度融合",
    intro: "混元大模型深度融入微信生态，覆盖十亿级用户场景。",
    website: "https://www.tencent.com",
    careerUrl: "https://careers.tencent.com",
  },

  // ---------- 行业垂直类 ----------
  {
    company: "华为",
    models: ["盘古 (Pangu)"],
    type: "industry",
    keyFeature: "政务/煤矿/气象垂直领域",
    intro: "盘古大模型深耕政务、煤矿、气象等垂直行业。",
    website: "https://www.huawei.com",
    careerUrl: "https://career.huawei.com",
  },
  {
    company: "科大讯飞",
    models: ["讯飞星火 (Spark)"],
    type: "industry",
    keyFeature: "语音AI + 教育/医疗场景",
    intro: "讯飞星火大模型，语音 AI 与教育、医疗场景领先。",
    website: "https://www.iflytek.com",
    careerUrl: "https://job.iflytek.com",
  },
  {
    company: "商汤科技",
    models: ["商量 (SenseChat)", "日日新 (SenseNova)"],
    type: "industry",
    keyFeature: "计算机视觉 + 智慧城市/金融",
    intro: "计算机视觉领军企业，推出商量与日日新大模型。",
    website: "https://www.sensetime.com",
    careerUrl: "https://www.sensetime.com/career",
  },
  {
    company: "美团",
    models: ["LongCat"],
    type: "industry",
    keyFeature: "本地生活场景驱动",
    intro: "LongCat 大模型深耕本地生活场景。",
    website: "https://www.meituan.com",
    careerUrl: "https://zhaopin.meituan.com",
  },
  {
    company: "京东",
    models: ["言犀 (JoyAI)"],
    type: "industry",
    keyFeature: "零售/物流供应链",
    intro: "言犀大模型服务零售与物流供应链。",
    website: "https://www.jd.com",
    careerUrl: "https://zhaopin.jd.com",
  },
  {
    company: "360",
    models: ["360智脑"],
    type: "industry",
    keyFeature: "搜索 + 安全AI",
    intro: "360 智脑大模型，结合搜索与安全 AI。",
    website: "https://www.360.cn",
    careerUrl: "https://hr.360.cn",
  },

  // ---------- 创业六小虎 ----------
  {
    company: "智谱AI",
    models: ["GLM系列", "CodeGeeX"],
    type: "startup",
    keyFeature: "清华系，技术积淀深",
    intro: "GLM 大模型开发者，国内领先的大模型创业公司。",
    website: "https://www.zhipuai.cn",
    careerUrl: "https://www.zhipuai.cn",
    isOpenSource: true,
  },
  {
    company: "MiniMax",
    models: ["MiniMax系列", "abab", "海螺AI (Hailuo)"],
    type: "startup",
    keyFeature: "全模态（文本/语音/视频）",
    intro: "全模态大模型创业公司，推出海螺 AI 与 abab 系列。",
    website: "https://www.minimax.io",
    careerUrl: "https://www.minimax.io/careers",
  },
  {
    company: "百川智能",
    models: ["百川 (Baichuan)"],
    type: "startup",
    keyFeature: "王小川创立，开源友好",
    intro: "王小川创立，开源友好的大模型创业公司。",
    website: "https://www.baichuan-ai.com",
    careerUrl: "https://www.baichuan-ai.com",
    isOpenSource: true,
  },
  {
    company: "月之暗面",
    models: ["Kimi"],
    type: "startup",
    keyFeature: "长文本处理能力突出",
    intro: "Kimi 大模型，长文本处理能力行业领先。",
    website: "https://www.moonshot.cn",
    careerUrl: "https://www.moonshot.cn",
  },
  {
    company: "阶跃星辰",
    models: ["Step系列"],
    type: "startup",
    keyFeature: "通用大模型后起之秀",
    intro: "Step 系列通用大模型，后起之秀。",
    website: "https://www.stepfun.com",
    careerUrl: "https://www.stepfun.com",
  },
  {
    company: "零一万物",
    models: ["Yi系列"],
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
    models: ["DeepSeek系列"],
    type: "technical",
    keyFeature: "开源 + 强推理能力，性价比高",
    intro: "DeepSeek 开源大模型，强推理能力与高性价比。",
    website: "https://www.deepseek.com",
    careerUrl: "https://www.deepseek.com",
    isOpenSource: true,
  },
  {
    company: "面壁智能",
    models: ["MiniCPM系列"],
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
    models: ["MiMo"],
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

// 首页 Hero 中重点展示的国内 AI 公司
export const AI_COMPANIES = [
  "DeepSeek",
  "MiniMax",
  "智谱AI",
  "月之暗面(Kimi)",
  "字节(豆包)",
  "通义千问(Qwen)",
] as const;

import {
  Ai360,
  Alibaba,
  Baichuan,
  Baidu,
  ByteDance,
  ChatGLM,
  CodeGeeX,
  DeepSeek,
  Doubao,
  Hailuo,
  Huawei,
  Hunyuan,
  IFlyTekCloud,
  Kimi,
  Minimax,
  Moonshot,
  Qwen,
  Spark,
  Stepfun,
  Tencent,
  XiaomiMiMo,
  Yuanbao,
  Zhipu,
} from "@lobehub/icons";
import type { ComponentType, CSSProperties } from "react";

/** 品牌图标类型：默认导出是单色版（currentColor），Color 是品牌彩色版（部分品牌无），colorPrimary 是品牌主色 */
type BrandIcon = ComponentType<{
  className?: string;
  style?: CSSProperties;
}> & {
  Color?: ComponentType<{ className?: string }>;
  colorPrimary?: string;
};

/** 图标 id → @lobehub/icons 组件 */
const ICON_MAP: Record<string, BrandIcon> = {
  ai360: Ai360,
  alibaba: Alibaba,
  baichuan: Baichuan,
  baidu: Baidu,
  bytedance: ByteDance,
  chatglm: ChatGLM,
  codegeex: CodeGeeX,
  deepseek: DeepSeek,
  doubao: Doubao,
  hailuo: Hailuo,
  huawei: Huawei,
  hunyuan: Hunyuan,
  iflytekcloud: IFlyTekCloud,
  kimi: Kimi,
  minimax: Minimax,
  moonshot: Moonshot,
  qwen: Qwen,
  spark: Spark,
  stepfun: Stepfun,
  tencent: Tencent,
  xiaomimimo: XiaomiMiMo,
  yuanbao: Yuanbao,
  zhipu: Zhipu,
};

/** 通用 Logo 头像：按图标 id 渲染 @lobehub/icons 的清晰矢量 logo，未收录时回退为品牌色首字母徽标 */
export default function LogoAvatar({
  icon,
  name,
  className = "size-8",
}: {
  icon?: string;
  name: string;
  className?: string;
}) {
  const Icon = icon ? ICON_MAP[icon] : undefined;

  if (!Icon) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg bg-(--primary)/12 font-bold text-(--primary) ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  // 优先渲染品牌彩色版；仅单色的品牌（如 Moonshot）用品牌主色给单色图标上色
  const ColorIcon = Icon.Color;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) ${className}`}
    >
      {ColorIcon ? (
        <ColorIcon className="size-full" />
      ) : (
        <Icon className="size-full" style={{ color: Icon.colorPrimary }} />
      )}
    </span>
  );
}

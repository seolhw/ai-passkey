import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";
import { env } from "#/env";

/**
 * DeepSeek（OpenAI 兼容接口）文本适配器
 */
export function deepseekAdapter() {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 DEEPSEEK_API_KEY，请在环境变量中设置");
  }
  return openaiCompatibleText("deepseek-v4-flash", {
    baseURL: "https://api.deepseek.com",
    apiKey,
  });
}

/** 从模型输出中提取 JSON（容忍 ```json 代码块包裹或前后夹杂文字），解析失败返回 undefined */
export function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // 模型在 JSON 前后夹杂了说明文字：取第一个 { 到最后一个 } 之间的内容再解析
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return undefined;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return undefined;
    }
  }
}

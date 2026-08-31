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

/** 从模型输出中提取 JSON（容忍 ```json 代码块包裹），解析失败返回 undefined */
export function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
}

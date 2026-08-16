export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function readDeepSeekConfig(env: Partial<NodeJS.ProcessEnv> = process.env): DeepSeekConfig {
  const apiKey = env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  return {
    apiKey,
    baseUrl: (env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, ""),
    model: env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
  };
}

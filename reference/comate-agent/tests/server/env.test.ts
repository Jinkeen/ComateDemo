import { expect, it } from "vitest";
import { readDeepSeekConfig } from "@/server/env";

it("rejects a missing DeepSeek key without exposing a secret", () => {
  expect(() => readDeepSeekConfig({})).toThrow("DEEPSEEK_API_KEY 未配置");
});

it("reads the server-only DeepSeek configuration", () => {
  expect(readDeepSeekConfig({ DEEPSEEK_API_KEY: "secret", DEEPSEEK_BASE_URL: "https://api.deepseek.com/", DEEPSEEK_MODEL: "deepseek-chat" }))
    .toEqual({ apiKey: "secret", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" });
});

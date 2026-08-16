import { expect, it } from "vitest";
import { parseAgentResponse, parseSearchNarrativeResponse, questionFromAgent } from "@/features/recruiting-agent/domain/agent-schema";
import { getQuestion } from "@/features/role-brief/domain/questions";

it("keeps the server-selected field even when the Agent only returns wording", () => {
  const response = parseAgentResponse({ agentSummary: "继续明确候选人的地点范围。", prompt: "希望采用哪种方式？", options: ["完全远程"], allowCustom: true });
  expect(questionFromAgent(getQuestion("location"), response).id).toBe("location");
});

it("accepts a bounded question for the current field", () => {
  const response = parseAgentResponse({ agentSummary: "地点确认后可以缩小初步候选池。", prompt: "这个职位希望候选人在哪里办公？", options: ["中国大陆", "远程优先"], allowCustom: true });
  expect(questionFromAgent(getQuestion("location"), response).options).toEqual(["中国大陆", "远程优先"]);
});

it("parses the candidate-requirement search narrative", () => {
  const narrative = parseSearchNarrativeResponse({
    searchNarrative: "我将搜索以下职位：中级 AI产品经理。候选人需会写PRD、做竞品分析，并具备0-1产品落地能力。",
  });
  expect(narrative).toContain("会写PRD、做竞品分析");
});

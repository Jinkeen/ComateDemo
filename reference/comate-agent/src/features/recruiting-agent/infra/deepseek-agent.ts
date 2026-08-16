import { readDeepSeekConfig } from "@/server/env";
import { buildAgentContext, buildSearchNarrativeContext, parseAgentResponse, parseSearchNarrativeResponse, questionFromAgent } from "../domain/agent-schema";
import { buildSearchNarrative, dumpsOriginalDescription } from "@/features/role-brief/domain/presentation";
import type { ClarificationQuestion, RoleBrief } from "@/features/role-brief/domain/types";

export interface AgentQuestionResult {
  summary: string;
  question: ClarificationQuestion;
  usedFallback: boolean;
}

function fallback(role: RoleBrief, question: ClarificationQuestion): AgentQuestionResult {
  const previous = role.answers.at(-1);
  return {
    summary: previous ? `已记录“${previous.rawValue}”，接下来继续确认${question.id}相关要求。` : "我会通过几道简短问题，逐步收缩候选人范围。",
    question,
    usedFallback: true,
  };
}

export class DeepSeekRecruitingAgent {
  async ask(role: RoleBrief, question: ClarificationQuestion): Promise<AgentQuestionResult> {
    try {
      const config = readDeepSeekConfig();
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          max_tokens: 700,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "你是招聘澄清 Agent。只输出 JSON，不输出推理。JSON 必须含 agentSummary、prompt、helperText、options、allowCustom。不得新增字段，不得输出 markdown。" },
            { role: "user", content: buildAgentContext(role, question) },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        return fallback(role, question);
      }
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        return fallback(role, question);
      }
      const parsed = parseAgentResponse(JSON.parse(content));
      return { summary: parsed.agentSummary, question: questionFromAgent(question, parsed), usedFallback: false };
    } catch {
      return fallback(role, question);
    }
  }

  async summarizeCandidateRequirements(role: RoleBrief): Promise<string> {
    try {
      const config = readDeepSeekConfig();
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "你是招聘搜索条件归纳助手。只输出 JSON，不输出推理。JSON 必须含 searchNarrative。用一段中文总结将要搜索的候选人画像：职位、职级、地点、工作方式，以及能力、学历、行业、排除背景。原始需求只保留对候选人的能力要求，丢掉「我需要招聘某职位」这类套话，合并重复技能。不要写公司介绍、团队规模、保密策略、薪酬、签证或面试流程。以「我将搜索以下职位：」开头，80 到 220 字。不要 markdown，不要「如需调整」。",
            },
            { role: "user", content: buildSearchNarrativeContext(role) },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        return buildSearchNarrative(role);
      }
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        return buildSearchNarrative(role);
      }
      const narrative = parseSearchNarrativeResponse(JSON.parse(content));
      return dumpsOriginalDescription(narrative, role.originalDescription) ? buildSearchNarrative(role) : narrative;
    } catch {
      return buildSearchNarrative(role);
    }
  }
}

import { z } from "zod";
import { extractOriginalCandidateRequirements } from "@/features/role-brief/domain/presentation";
import type { ClarificationQuestion, QuestionId, RoleBrief } from "@/features/role-brief/domain/types";

const agentResponseSchema = z.object({
  agentSummary: z.string().trim().min(4).max(180),
  prompt: z.string().trim().min(6).max(160),
  helperText: z.string().trim().max(120).optional(),
  options: z.array(z.string().trim().min(1).max(48)).min(0).max(6),
  allowCustom: z.boolean().default(true),
});

export type DeepSeekQuestionDraft = z.infer<typeof agentResponseSchema>;

export function parseAgentResponse(input: unknown): DeepSeekQuestionDraft {
  return agentResponseSchema.parse(input);
}

export function questionFromAgent(defaultQuestion: ClarificationQuestion, response: DeepSeekQuestionDraft): ClarificationQuestion {
  return {
    ...defaultQuestion,
    prompt: response.prompt,
    helperText: response.helperText || defaultQuestion.helperText,
    options: response.options.length ? response.options : defaultQuestion.options,
  };
}

export function buildAgentContext(role: RoleBrief, question: ClarificationQuestion): string {
  const answered = role.answers.map((answer) => `${answer.questionId}: ${answer.normalizedValue}`).join("\n") || "暂无";
  return JSON.stringify({
    originalDescription: role.originalDescription,
    roleTitle: role.title,
    answered,
    currentQuestion: { prompt: question.prompt, options: question.options, required: question.required, allowsMultiple: question.allowsMultiple ?? false },
    instruction: "只生成当前字段的一道中文澄清题。不得要求联系方式、身份证、年龄、性别、民族、婚育、健康或其他敏感个人信息。",
  });
}

const searchNarrativeSchema = z.object({
  searchNarrative: z.string().trim().min(20).max(360),
});

export function parseSearchNarrativeResponse(input: unknown): string {
  return searchNarrativeSchema.parse(input).searchNarrative.replace(/\s+/g, " ").trim();
}

export function buildSearchNarrativeContext(role: RoleBrief): string {
  return JSON.stringify({
    originalRequirementPhrases: extractOriginalCandidateRequirements(role.originalDescription, {
      title: role.title,
      covered: role.mustHaves,
    }),
    title: role.title,
    location: role.location,
    workModel: role.workModel,
    seniority: role.seniority,
    mustHaves: role.mustHaves,
    education: role.education,
    domain: role.domain,
    exclusions: role.exclusions,
    instruction: "只归纳对候选人的要求。原始需求只使用 originalRequirementPhrases，不要复述「我需要招聘」等招聘套话，不要原样粘贴整段原始描述。合并重复技能。不要写公司介绍、团队规模、保密策略、薪酬、签证或面试流程。",
  });
}

export type { QuestionId };

import {
  categoryTransitions,
  clarificationQuestions,
  getQuestion,
  isCategoryEntryQuestion,
  questionFieldLabels,
} from "./questions";
import type { ClarificationQuestion, QuestionCategory, QuestionId, RoleBrief } from "./types";

export interface ConversationTurn {
  questionId: QuestionId;
  question: string;
  answer: string;
}

export type ConversationItem =
  | { kind: "transition"; category: QuestionCategory; text: string }
  | { kind: "group"; category: QuestionCategory; turns: ConversationTurn[] };

export type ProgressStatus = "complete" | "current" | "upcoming";

export interface ProgressItem {
  id: "clarify" | "calibrate" | "source" | "complete";
  label: string;
  status: ProgressStatus;
}

export interface SummaryDatum {
  questionId: QuestionId;
  label: string;
  value: string;
  pending: boolean;
}

export interface RoleSummaryPresentation {
  title: string;
  meta: string[];
  compensation: SummaryDatum;
  visaPolicy: SummaryDatum;
  candidate: SummaryDatum[];
  work: SummaryDatum[];
  company: SummaryDatum[];
  interview: SummaryDatum;
  interviewSteps: string[];
  answeredCount: number;
  totalCount: number;
  completeness: number;
}

const pendingValue = "待确认";

function datum(questionId: QuestionId, label: string, value?: string): SummaryDatum {
  const normalized = value?.trim();

  return {
    questionId,
    label,
    value: normalized || pendingValue,
    pending: !normalized,
  };
}

function interviewSteps(value?: string): string[] {
  if (!value || value === "待确认") {
    return [pendingValue];
  }

  if (/三|3/.test(value)) {
    return ["业务面", "专业面", "终面"];
  }

  if (/两|二|2/.test(value)) {
    return ["业务面", "终面"];
  }

  const customSteps = value
    .split(/[,，、/→>\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return customSteps.length > 1 ? customSteps.slice(0, 4) : [value];
}

export function buildRoleSummary(role: RoleBrief): RoleSummaryPresentation {
  const answeredCount = new Set(role.answers.map((answer) => answer.questionId)).size;
  const totalCount = clarificationQuestions.length;
  const compensation =
    role.compensation === "填写范围" ? "待确认具体范围" : role.compensation;

  return {
    title: role.title,
    meta: [
      role.seniority || pendingValue,
      role.location || pendingValue,
      role.workModel || pendingValue,
    ],
    compensation: datum("compensation", "薪酬范围", compensation),
    visaPolicy: datum("visaPolicy", "签证 / 工作许可", role.visaPolicy),
    candidate: [
      datum("seniority", "目标职级", role.seniority),
      datum("education", "教育背景", role.education),
      datum("mustHaves", "关键能力", role.mustHaves.join("、")),
      datum("domain", "行业经验", role.domain),
    ],
    work: [
      datum("location", "招聘地区", role.location),
      datum("workModel", "工作方式", role.workModel),
    ],
    company: [
      datum("companyStage", "公司阶段", role.companyStage),
      datum("companyDomain", "业务领域", role.companyDomain),
      datum(
        "companyVisibility",
        "候选人可见",
        role.companyVisibility === "confidential"
          ? "候选人侧保密"
          : role.companyVisibility === "visible"
            ? "展示公司信息"
            : undefined,
      ),
      datum("companyCue", "团队介绍", role.companyCue),
    ],
    interview: datum("interviewProcess", "面试流程", role.interviewProcess),
    interviewSteps: interviewSteps(role.interviewProcess),
    answeredCount,
    totalCount,
    completeness: Math.round((answeredCount / totalCount) * 100),
  };
}

const skippedNarrativeValues = new Set([
  "待确认",
  "不限",
  "暂不公开",
  "暂时跳过",
  "待确认具体范围",
  "填写范围",
]);

function meaningful(value?: string | null): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text || skippedNarrativeValues.has(text)) {
    return undefined;
  }

  return text;
}

const hiringIntentPrefix =
  /^(?:我)?(?:现在|目前)?(?:需要|想要|希望|打算)?(?:招聘|招募|寻找|招(?:一)?(?:个|位|名)?)(?:一位|一名|一个)?/;
const requirementLead = /^(?:需要|要求|须|必须)+/;
const requirementSignal = /会|能|熟悉|精通|掌握|具备|负责|经验|做过|独立|落地|PRD|prd|竞品|协作|交付|设计|分析/;

function compactText(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase().replace(/从?0到1/g, "0-1");
}

function uniqueRequirementPhrases(phrases: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const phrase of phrases) {
    const key = compactText(phrase).replace(/^(?:会|能|负责)/, "");
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(phrase);
  }
  return result;
}

function isHiringIntentClause(clause: string, title?: string): boolean {
  const trimmed = clause.trim();
  if (hiringIntentPrefix.test(trimmed)) {
    const leftover = trimmed.replace(hiringIntentPrefix, "").replace(/^的/, "").trim();
    if (!leftover || !requirementSignal.test(leftover)) {
      return true;
    }
  }
  if (title && compactText(trimmed) === compactText(title)) {
    return true;
  }
  return /^(?:一位|一名|一个)?(?:AI\s*)?产品经理$/.test(trimmed);
}

function splitRequirementClauses(description: string): string[] {
  const parts = description
    .split(/[，。；、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const expanded: string[] = [];
  for (const part of parts) {
    if (/和/.test(part) && /会|能|熟悉|精通|掌握/.test(part)) {
      expanded.push(...part.split(/和/).map((item) => item.trim()).filter(Boolean));
    } else {
      expanded.push(part);
    }
  }
  return expanded;
}

export function extractOriginalCandidateRequirements(
  description: string,
  options: { title?: string; covered?: string[] } = {},
): string[] {
  const text = meaningful(description);
  if (!text) {
    return [];
  }

  const covered = (options.covered ?? []).map(compactText).filter(Boolean);
  return uniqueRequirementPhrases(
    splitRequirementClauses(text)
      .filter((clause) => !isHiringIntentClause(clause, options.title))
      .map((clause) => clause.replace(requirementLead, "").trim())
      .filter((clause) => clause.length >= 2 && requirementSignal.test(clause)),
  ).filter((phrase) => {
    const compact = compactText(phrase);
    return !covered.some((item) => compact.includes(item) || item.includes(compact));
  });
}

function formatOriginalRequirements(phrases: string[]): string | undefined {
  if (!phrases.length) {
    return undefined;
  }

  const joined = phrases.join("、");
  return /^(?:会|能|负责|具备|熟悉|精通|掌握)/.test(phrases[0]) ? `候选人需${joined}` : `候选人需具备${joined}`;
}

export function dumpsOriginalDescription(narrative: string, originalDescription: string): boolean {
  const narrativeText = compactText(narrative);
  const originalText = compactText(originalDescription);
  return originalText.length >= 12 && narrativeText.includes(originalText);
}

export function resolveSearchNarrative(role: RoleBrief): string {
  const stored = meaningful(role.searchNarrative);
  if (stored && !dumpsOriginalDescription(stored, role.originalDescription)) {
    return stored;
  }

  return buildSearchNarrative(role);
}

export function buildSearchNarrative(role: RoleBrief): string {
  const title = meaningful(role.title) || "目标职位";
  const seniority = meaningful(role.seniority);
  const titledRole = seniority ? `${seniority} ${title}` : title;
  const roleLine = [titledRole, meaningful(role.location), meaningful(role.workModel)].filter(Boolean).join("，");
  const sentences = [`我将搜索以下职位：${roleLine}`];

  const originalRequirements = formatOriginalRequirements(
    extractOriginalCandidateRequirements(role.originalDescription, {
      title: role.title,
      covered: role.mustHaves,
    }),
  );
  if (originalRequirements) {
    sentences.push(originalRequirements);
  }

  const profile: string[] = [];
  if (role.mustHaves.length) {
    profile.push(`须具备${role.mustHaves.join("、")}`);
  }
  const education = meaningful(role.education);
  if (education) {
    profile.push(`学历${education}`);
  }
  const domain = meaningful(role.domain);
  if (domain) {
    profile.push(`偏好${domain}经验`);
  }
  if (role.exclusions.length) {
    profile.push(`不考虑${role.exclusions.join("、")}`);
  }
  if (profile.length) {
    sentences.push(profile.join("，"));
  }

  return `${sentences.join("。")}。`;
}

export function resolveClarificationTransition(
  role: RoleBrief,
  question?: ClarificationQuestion | null,
): string | null {
  if (!question) {
    return null;
  }

  const canonical = getQuestion(question.id);
  const existingAnswer = role.answers.find((item) => item.questionId === canonical.id);

  if (existingAnswer) {
    return `正在回看「${questionFieldLabels[canonical.id]}」，可直接修改后继续。`;
  }

  if (!isCategoryEntryQuestion(canonical.id)) {
    return null;
  }

  return categoryTransitions[canonical.category];
}

export function buildConversationItems(
  role: RoleBrief,
  hideQuestionId?: QuestionId | null,
): ConversationItem[] {
  const items: ConversationItem[] = [];
  let currentGroup: Extract<ConversationItem, { kind: "group" }> | null = null;

  for (const question of clarificationQuestions) {
    if (question.id === hideQuestionId) {
      continue;
    }

    const answer = role.answers.find((item) => item.questionId === question.id);
    if (!answer) {
      continue;
    }

    if (!currentGroup || currentGroup.category !== question.category) {
      items.push({
        kind: "transition",
        category: question.category,
        text: categoryTransitions[question.category],
      });
      currentGroup = { kind: "group", category: question.category, turns: [] };
      items.push(currentGroup);
    }

    currentGroup.turns.push({
      questionId: question.id,
      question: question.prompt,
      answer: answer.rawValue || "暂时跳过",
    });
  }

  return items;
}

export function buildConversationTranscript(role: RoleBrief): ConversationTurn[] {
  return buildConversationItems(role).flatMap((item) => (item.kind === "group" ? item.turns : []));
}

export function buildProgressItems(role: RoleBrief): ProgressItem[] {
  const clarificationComplete = role.lifecycleState === "brief_ready" || role.lifecycleState === "confirmed";
  const finished = role.lifecycleState === "confirmed";

  return [
    { id: "clarify", label: "澄清职位", status: clarificationComplete ? "complete" : "current" },
    { id: "calibrate", label: "评测样本", status: clarificationComplete && !finished ? "current" : "upcoming" },
    { id: "source", label: "寻找并联系", status: "upcoming" },
    { id: "complete", label: "完工", status: finished ? "current" : "upcoming" },
  ];
}

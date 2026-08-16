import {
  clarificationQuestions,
  getQuestion,
  lifecycleForQuestion,
} from "./questions";
import { createAnonymousCompanyProfile } from "./anonymous-company";
import type {
  AnswerSource,
  ClarificationAnswer,
  QuestionId,
  RoleBrief,
  WorkflowAuditEvent,
} from "./types";

const now = () => new Date().toISOString();

function createId(prefix: string): string {
  return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function inferTitle(description: string): string {
  if (/AI.*产品经理|产品经理.*AI/i.test(description)) {
    return "AI 产品经理";
  }

  return "待确认职位";
}

function normalizedValues(value: string): string[] {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyAnswer(role: RoleBrief, questionId: QuestionId, value: string): RoleBrief {
  const normalized = normalizedValues(value);

  switch (questionId) {
    case "location":
      return { ...role, location: value };
    case "workModel":
      return { ...role, workModel: value };
    case "seniority":
      return { ...role, seniority: value };
    case "mustHaves":
      return { ...role, mustHaves: normalized };
    case "education":
      return { ...role, education: value };
    case "domain":
      return { ...role, domain: value };
    case "exclusions":
      return { ...role, exclusions: normalized };
    case "companyCue":
      return { ...role, companyCue: value };
    case "companyStage":
      return { ...role, companyStage: value };
    case "companyDomain":
      return { ...role, companyDomain: value };
    case "companyVisibility":
      return createAnonymousCompanyProfile({
        ...role,
        companyVisibility: value === "保持保密" ? "confidential" : "visible",
      })
        ? {
            ...role,
            companyVisibility: "confidential",
            anonymousCompanyProfile: createAnonymousCompanyProfile({
              ...role,
              companyVisibility: "confidential",
            }),
          }
        : { ...role, companyVisibility: "visible", anonymousCompanyProfile: undefined };
    case "compensation":
      return { ...role, compensation: value };
    case "visaPolicy":
      return { ...role, visaPolicy: value };
    case "interviewProcess":
      return { ...role, interviewProcess: value };
  }
}

function nextQuestionId(currentQuestionId: QuestionId): QuestionId | null {
  const currentIndex = clarificationQuestions.findIndex(
    (item) => item.id === currentQuestionId,
  );
  const nextQuestion = clarificationQuestions[currentIndex + 1];

  return nextQuestion?.id ?? null;
}

function questionOrderIndex(questionId: QuestionId): number {
  return clarificationQuestions.findIndex((item) => item.id === questionId);
}

function answersUpTo(
  answers: ClarificationAnswer[],
  questionId: QuestionId,
  includeCurrent: boolean,
): ClarificationAnswer[] {
  const limit = questionOrderIndex(questionId);
  return answers.filter((item) => {
    const index = questionOrderIndex(item.questionId);
    return includeCurrent ? index <= limit : index < limit;
  });
}

function clearDerivedFields(role: RoleBrief): RoleBrief {
  return {
    ...role,
    location: undefined,
    workModel: undefined,
    seniority: undefined,
    mustHaves: [],
    education: undefined,
    domain: undefined,
    exclusions: [],
    companyCue: undefined,
    companyStage: undefined,
    companyDomain: undefined,
    companyVisibility: undefined,
    anonymousCompanyProfile: undefined,
    compensation: undefined,
    visaPolicy: undefined,
    interviewProcess: undefined,
    answers: [],
  };
}

function rebuildRoleFromAnswers(
  role: RoleBrief,
  answers: ClarificationAnswer[],
  activeQuestionId: QuestionId | null,
): RoleBrief {
  let next = clearDerivedFields(role);

  for (const answer of answers) {
    next = {
      ...applyAnswer(next, answer.questionId, answer.rawValue),
      answers: [...next.answers, answer],
    };
  }

  return {
    ...next,
    activeQuestionId,
    lifecycleState: activeQuestionId ? lifecycleForQuestion(activeQuestionId) : "brief_ready",
    criteriaVersion: role.criteriaVersion,
    updatedAt: now(),
  };
}

export function createRoleDraft(originalDescription: string): RoleBrief {
  const createdAt = now();

  return {
    id: createId("role"),
    title: inferTitle(originalDescription),
    originalDescription,
    lifecycleState: "clarification_location",
    activeQuestionId: "location",
    answers: [],
    mustHaves: [],
    exclusions: [],
    criteriaVersion: 1,
    createdAt,
    updatedAt: createdAt,
  };
}

export function getActiveQuestion(role: RoleBrief) {
  return role.activeQuestionId ? getQuestion(role.activeQuestionId) : null;
}

export function answerQuestion(
  role: RoleBrief,
  questionId: QuestionId,
  rawValue: string,
  source: AnswerSource = "option",
): RoleBrief {
  if (role.lifecycleState === "confirmed") {
    throw new Error("职位条件已确认，不能再修改澄清回答。");
  }

  if (role.activeQuestionId !== questionId) {
    throw new Error("只能回答当前 Agent 提问的问题。");
  }

  const question = getQuestion(questionId);
  const value = rawValue.trim();

  if (question.required && !value) {
    throw new Error("请先回答必填问题。");
  }

  const answeredAt = now();
  const answer: ClarificationAnswer = {
    questionId,
    rawValue: value,
    normalizedValue: value,
    required: question.required,
    source,
    answeredAt,
  };

  const existing = role.answers.find((item) => item.questionId === questionId);
  const nextQuestion = nextQuestionId(questionId);

  // 回看后未改答案：保留后续回答，只前进到下一步，便于“返回查看”
  if (existing && existing.rawValue.trim() === value) {
    return {
      ...role,
      activeQuestionId: nextQuestion,
      lifecycleState: nextQuestion ? lifecycleForQuestion(nextQuestion) : "brief_ready",
      updatedAt: answeredAt,
    };
  }

  const keptAnswers = answersUpTo(role.answers, questionId, false);
  const rebuilt = rebuildRoleFromAnswers(
    { ...role, criteriaVersion: role.criteriaVersion + 1 },
    [...keptAnswers, answer],
    nextQuestion,
  );

  return rebuilt;
}

export function skipOptionalQuestion(role: RoleBrief): RoleBrief {
  const activeQuestion = getActiveQuestion(role);

  if (!activeQuestion || activeQuestion.required) {
    throw new Error("当前问题不可跳过。");
  }

  const nextQuestion = nextQuestionId(activeQuestion.id);

  return {
    ...role,
    activeQuestionId: nextQuestion,
    lifecycleState: nextQuestion
      ? lifecycleForQuestion(nextQuestion)
      : "brief_ready",
    updatedAt: now(),
  };
}

export function goToPreviousQuestion(role: RoleBrief): RoleBrief {
  if (role.lifecycleState === "confirmed") {
    return role;
  }

  const activeIndex = role.activeQuestionId
    ? questionOrderIndex(role.activeQuestionId)
    : clarificationQuestions.length;
  const previousQuestion = clarificationQuestions[activeIndex - 1];

  if (!previousQuestion) {
    return role;
  }

  return {
    ...role,
    activeQuestionId: previousQuestion.id,
    lifecycleState: lifecycleForQuestion(previousQuestion.id),
    updatedAt: now(),
  };
}

export function revisitQuestion(role: RoleBrief, questionId: QuestionId): RoleBrief {
  if (role.lifecycleState === "confirmed") {
    throw new Error("职位条件已确认，当前仅可查看摘要。");
  }

  const targetIndex = questionOrderIndex(questionId);
  if (targetIndex < 0) {
    throw new Error("未知的澄清问题。");
  }

  const activeIndex = role.activeQuestionId
    ? questionOrderIndex(role.activeQuestionId)
    : clarificationQuestions.length;
  const answered = role.answers.some((item) => item.questionId === questionId);
  const completedClarification = role.lifecycleState === "brief_ready";

  if (
    targetIndex > activeIndex ||
    (!completedClarification && !answered && targetIndex !== activeIndex)
  ) {
    throw new Error("只能返回已走过的步骤查看或修改。");
  }

  return {
    ...role,
    activeQuestionId: questionId,
    lifecycleState: lifecycleForQuestion(questionId),
    updatedAt: now(),
  };
}

export function reopenClarification(role: RoleBrief): RoleBrief {
  if (role.lifecycleState !== "confirmed" && role.lifecycleState !== "brief_ready") {
    return role;
  }

  const lastAnswered = role.answers.at(-1);
  const questionId = lastAnswered?.questionId ?? role.activeQuestionId ?? "location";

  return {
    ...role,
    lifecycleState: lifecycleForQuestion(questionId),
    activeQuestionId: questionId,
    updatedAt: now(),
  };
}

export function confirmBrief(role: RoleBrief): RoleBrief {
  if (role.lifecycleState !== "brief_ready") {
    throw new Error("请先完成职位澄清，再确认搜索条件。");
  }

  return {
    ...role,
    lifecycleState: "confirmed",
    updatedAt: now(),
  };
}

export function createAuditEvent(
  role: RoleBrief,
  action: WorkflowAuditEvent["action"],
  questionId?: QuestionId,
): WorkflowAuditEvent {
  return {
    id: createId("audit"),
    roleId: role.id,
    action,
    questionId,
    state: role.lifecycleState,
    createdAt: now(),
  };
}

import type {
  ClarificationQuestion,
  QuestionCategory,
  QuestionGroup,
  QuestionId,
  RoleLifecycleState,
} from "./types";

export const clarificationQuestions: ClarificationQuestion[] = [
  {
    id: "location",
    group: "location",
    category: "arrangement",
    prompt: "这个职位主要在哪个地区招聘？",
    helperText: "地点是搜索候选人的必填条件。",
    required: true,
    options: ["中国大陆", "香港 / 台湾", "新加坡", "远程优先"],
  },
  {
    id: "workModel",
    group: "core",
    category: "arrangement",
    prompt: "希望候选人采用哪种工作方式？",
    required: true,
    options: ["全职坐班", "混合办公", "完全远程", "可协商"],
  },
  {
    id: "seniority",
    group: "core",
    category: "profile",
    prompt: "你希望候选人处于什么职级？",
    required: true,
    options: ["初级", "中级", "高级", "负责人 / Lead"],
  },
  {
    id: "mustHaves",
    group: "core",
    category: "profile",
    prompt: "这位候选人必须具备哪些关键能力？",
    helperText: "可选择或补充多个关键词。",
    required: true,
    allowsMultiple: true,
    options: ["AI 产品设计", "0-1 产品落地", "大模型应用", "跨团队协作"],
  },
  {
    id: "education",
    group: "preferences",
    category: "profile",
    prompt: "学历是否有偏好？",
    required: false,
    options: ["不限", "本科及以上", "硕士及以上", "特定专业优先"],
  },
  {
    id: "domain",
    group: "preferences",
    category: "profile",
    prompt: "是否偏好某些行业或经验背景？",
    required: false,
    options: ["不限", "AI / SaaS", "互联网产品", "企业服务"],
  },
  {
    id: "exclusions",
    group: "preferences",
    category: "profile",
    prompt: "是否有明确不考虑的背景？",
    required: false,
    allowsMultiple: true,
    options: ["纯销售背景", "无产品交付经验", "仅传统行业经验"],
  },
  {
    id: "companyCue",
    group: "company",
    category: "company",
    prompt: "请简述公司或团队情况，便于生成候选人可见的介绍。",
    required: false,
    options: [],
  },
  {
    id: "companyStage",
    group: "company",
    category: "company",
    prompt: "公司目前处于什么阶段？",
    required: false,
    options: ["早期创业", "成长期", "成熟业务", "大型集团内部团队"],
  },
  {
    id: "companyDomain",
    group: "company",
    category: "company",
    prompt: "公司主要所在领域是什么？",
    required: false,
    options: ["AI / SaaS", "企业服务", "消费互联网", "其他"],
  },
  {
    id: "companyVisibility",
    group: "company",
    category: "company",
    prompt: "候选人可见的公司信息是否需要匿名化？",
    required: true,
    options: ["展示公司信息", "保持保密"],
  },
  {
    id: "compensation",
    group: "logistics",
    category: "process",
    prompt: "薪酬范围或福利信息是否需要记录？",
    required: false,
    options: ["暂不公开", "面议", "填写范围"],
  },
  {
    id: "visaPolicy",
    group: "logistics",
    category: "process",
    prompt: "是否涉及签证或工作许可要求？",
    required: false,
    options: ["不涉及", "可协助", "必须已有工作许可"],
  },
  {
    id: "interviewProcess",
    group: "logistics",
    category: "process",
    prompt: "预计的面试流程是怎样的？",
    required: false,
    options: ["两轮面试", "三轮面试", "待确认"],
  },
];

const lifecycleByGroup: Record<QuestionGroup, RoleLifecycleState> = {
  location: "clarification_location",
  core: "clarification_core",
  preferences: "clarification_preferences",
  company: "clarification_company",
  logistics: "clarification_logistics",
};

export const questionFieldLabels: Record<QuestionId, string> = {
  location: "地点",
  workModel: "工作方式",
  seniority: "职级",
  mustHaves: "关键能力",
  education: "学历偏好",
  domain: "行业经验",
  exclusions: "排除条件",
  companyCue: "团队信息",
  companyStage: "公司阶段",
  companyDomain: "公司领域",
  companyVisibility: "公司展示方式",
  compensation: "薪酬信息",
  visaPolicy: "工作许可",
  interviewProcess: "面试流程",
};

export const categoryLabels: Record<QuestionCategory, string> = {
  arrangement: "岗位安排",
  profile: "人选标准",
  company: "公司画像",
  process: "招聘执行",
};

export const categoryTransitions: Record<QuestionCategory, string> = {
  arrangement: "先确认地点和工作方式，这两项会直接决定能搜到哪些人。",
  profile: "岗位安排已记下。接下来确认职级、能力和背景，用来收紧人选范围。",
  company: "人选标准已齐。接下来补公司介绍和是否匿名，这部分主要给候选人看。",
  process: "公司信息已确认。最后补充薪酬和面试流程，用于生成完整职位摘要。",
};

export const recommendationTransition =
  "检索已完成。接下来对照岗位要求与候选人画像，把匹配度最高的几位放在前面。";

export function getQuestion(questionId: QuestionId): ClarificationQuestion {
  const question = clarificationQuestions.find((item) => item.id === questionId);

  if (!question) {
    throw new Error("未定义的问题：" + questionId);
  }

  return question;
}

export function lifecycleForQuestion(questionId: QuestionId): RoleLifecycleState {
  return lifecycleByGroup[getQuestion(questionId).group];
}

export function isCategoryEntryQuestion(questionId: QuestionId): boolean {
  const question = getQuestion(questionId);
  const first = clarificationQuestions.find((item) => item.category === question.category);

  return first?.id === questionId;
}

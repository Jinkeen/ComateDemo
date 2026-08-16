export type RoleLifecycleState =
  | "draft"
  | "clarification_location"
  | "clarification_core"
  | "clarification_preferences"
  | "clarification_company"
  | "clarification_logistics"
  | "brief_ready"
  | "confirmed";

export type QuestionGroup =
  | "location"
  | "core"
  | "preferences"
  | "company"
  | "logistics";

export type QuestionCategory = "arrangement" | "profile" | "company" | "process";

export type QuestionId =
  | "location"
  | "workModel"
  | "seniority"
  | "mustHaves"
  | "education"
  | "domain"
  | "exclusions"
  | "companyCue"
  | "companyStage"
  | "companyDomain"
  | "companyVisibility"
  | "compensation"
  | "visaPolicy"
  | "interviewProcess";

export type AnswerSource = "option" | "custom";

export interface ClarificationAnswer {
  questionId: QuestionId;
  rawValue: string;
  normalizedValue: string;
  required: boolean;
  source: AnswerSource;
  answeredAt: string;
}

export interface AnonymousCompanyProfile {
  stage: string;
  domain: string;
  positioning: string;
}

export interface RoleBrief {
  id: string;
  title: string;
  originalDescription: string;
  lifecycleState: RoleLifecycleState;
  activeQuestionId: QuestionId | null;
  answers: ClarificationAnswer[];
  location?: string;
  workModel?: string;
  seniority?: string;
  mustHaves: string[];
  education?: string;
  domain?: string;
  exclusions: string[];
  companyCue?: string;
  companyStage?: string;
  companyDomain?: string;
  companyVisibility?: "visible" | "confidential";
  anonymousCompanyProfile?: AnonymousCompanyProfile;
  compensation?: string;
  visaPolicy?: string;
  interviewProcess?: string;
  searchNarrative?: string;
  criteriaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClarificationQuestion {
  id: QuestionId;
  group: QuestionGroup;
  category: QuestionCategory;
  prompt: string;
  helperText?: string;
  required: boolean;
  allowsMultiple?: boolean;
  options: string[];
}

export interface WorkflowAuditEvent {
  id: string;
  roleId: string;
  action: "created" | "answered" | "skipped" | "confirmed";
  questionId?: QuestionId;
  state: RoleLifecycleState;
  createdAt: string;
}

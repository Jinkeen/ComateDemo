import { answerQuestion, confirmBrief, createRoleDraft, getActiveQuestion, goToPreviousQuestion, reopenClarification, revisitQuestion, skipOptionalQuestion } from "@/features/role-brief/domain/workflow";
import type { AnswerSource, QuestionId, RoleBrief } from "@/features/role-brief/domain/types";
import { SqliteRoleRepository, type StoredWorkspace } from "../data/sqlite-role-repository";
import { DeepSeekRecruitingAgent } from "../infra/deepseek-agent";
import { RecruitingWorkflowService } from "@/features/recruiting-workflow/application/recruiting-workflow-service";
import type { StoredRecruitingWorkflow } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";

export interface WorkspaceSnapshot {
  role: RoleBrief;
  version: number;
  agentSummary: string | null;
  activeQuestion: StoredWorkspace["activeQuestion"];
  recruitingWorkflow: StoredRecruitingWorkflow | null;
}

export class WorkspaceNotFoundError extends Error {
  constructor() {
    super("未找到这个职位工作台。");
  }
}

export class InvalidWorkspaceActionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function snapshot(workspace: StoredWorkspace, recruitingWorkflow: StoredRecruitingWorkflow | null = null): WorkspaceSnapshot {
  return {
    role: workspace.role,
    version: workspace.version,
    agentSummary: workspace.agentSummary,
    activeQuestion: workspace.activeQuestion,
    recruitingWorkflow,
  };
}

function titleFromDescription(description: string): string {
  const match = description.match(/(?:招聘|招募|寻找)\s*([^，。；\n]{2,24})/);
  return match?.[1]?.trim() || createRoleDraft(description).title;
}

export class RoleWorkspaceService {
  constructor(
    private readonly repository = new SqliteRoleRepository(),
    private readonly agent = new DeepSeekRecruitingAgent(),
    private readonly recruitingWorkflow = new RecruitingWorkflowService(),
  ) {}

  async create(description: string): Promise<WorkspaceSnapshot> {
    const normalizedDescription = description.trim();
    if (normalizedDescription.length < 16 || normalizedDescription.length > 5000) {
      throw new InvalidWorkspaceActionError("职位描述需在 16 到 5000 个字符之间。");
    }
    const draft = createRoleDraft(normalizedDescription);
    const role = { ...draft, title: titleFromDescription(normalizedDescription) };
    const question = getActiveQuestion(role);
    if (!question) {
      throw new InvalidWorkspaceActionError("无法生成首个澄清问题。");
    }
    const generated = await this.agent.ask(role, question);
    const workspace: StoredWorkspace = {
      role,
      version: 1,
      agentSummary: generated.summary,
      activeQuestion: generated.question,
    };
    this.repository.createWorkspace(workspace);
    return snapshot(workspace, this.recruitingWorkflow.get(role.id));
  }

  get(roleId: string): WorkspaceSnapshot {
    const workspace = this.repository.getWorkspace(roleId);
    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }
    return snapshot(workspace, this.recruitingWorkflow.get(roleId));
  }

  async answer(input: { roleId: string; expectedVersion: number; questionId: QuestionId; value: string; source?: AnswerSource }): Promise<WorkspaceSnapshot> {
    const workspace = this.repository.getWorkspace(input.roleId);
    if (!workspace) throw new WorkspaceNotFoundError();
    const currentQuestion = workspace.activeQuestion ?? getActiveQuestion(workspace.role);
    if (!currentQuestion || currentQuestion.id !== input.questionId) {
      throw new InvalidWorkspaceActionError("只能提交当前 Agent 提问的问题。");
    }
    const role = answerQuestion(workspace.role, input.questionId, input.value, input.source);
    return this.persistNext(workspace, role, input.expectedVersion, "answered");
  }

  async skip(roleId: string, expectedVersion: number): Promise<WorkspaceSnapshot> {
    const workspace = this.requireWorkspace(roleId);
    return this.persistNext(workspace, skipOptionalQuestion(workspace.role), expectedVersion, "skipped");
  }

  async previous(roleId: string, expectedVersion: number): Promise<WorkspaceSnapshot> {
    const workspace = this.requireWorkspace(roleId);
    const role = goToPreviousQuestion(workspace.role);
    return this.persistNext(workspace, role, expectedVersion, "answered");
  }

  async revisit(roleId: string, expectedVersion: number, questionId: QuestionId): Promise<WorkspaceSnapshot> {
    const workspace = this.requireWorkspace(roleId);
    try {
      const role = revisitQuestion(workspace.role, questionId);
      return this.persistNext(workspace, role, expectedVersion, "answered");
    } catch (error) {
      throw new InvalidWorkspaceActionError(error instanceof Error ? error.message : "无法返回该步骤。");
    }
  }

  async reopen(roleId: string, expectedVersion: number): Promise<WorkspaceSnapshot> {
    const workspace = this.requireWorkspace(roleId);
    const role = reopenClarification(workspace.role);
    return this.persistNext(workspace, role, expectedVersion, "answered");
  }

  async confirm(roleId: string, expectedVersion: number): Promise<WorkspaceSnapshot> {
    const workspace = this.requireWorkspace(roleId);
    const role = confirmBrief(workspace.role);
    const updated = this.repository.updateWorkspace({
      workspace: { role, version: workspace.version, agentSummary: "职位条件已确认，正在准备本地候选人检索。", activeQuestion: null },
      expectedVersion,
      action: "confirmed",
    });
    const recruitingWorkflow = await this.recruitingWorkflow.initialize(role);
    return snapshot(updated, recruitingWorkflow);
  }

  private requireWorkspace(roleId: string): StoredWorkspace {
    const workspace = this.repository.getWorkspace(roleId);
    if (!workspace) throw new WorkspaceNotFoundError();
    return workspace;
  }

  private async persistNext(workspace: StoredWorkspace, role: RoleBrief, expectedVersion: number, action: "answered" | "skipped"): Promise<WorkspaceSnapshot> {
    const nextQuestion = getActiveQuestion(role);
    if (!nextQuestion) {
      const searchNarrative = await this.agent.summarizeCandidateRequirements(role);
      return snapshot(this.repository.updateWorkspace({
        workspace: {
          role: { ...role, searchNarrative },
          version: workspace.version,
          agentSummary: "职位要求已收集完成，请确认后开始检索本地虚构简历。",
          activeQuestion: null,
        },
        expectedVersion,
        action,
      }));
    }
    const generated = await this.agent.ask(role, nextQuestion);
    return snapshot(this.repository.updateWorkspace({
      workspace: {
        role: { ...role, searchNarrative: undefined },
        version: workspace.version,
        agentSummary: generated.summary,
        activeQuestion: generated.question,
      },
      expectedVersion,
      action: generated.usedFallback ? "agent_fallback" : action,
    }));
  }
}

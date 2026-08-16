import type { RoleBrief } from "@/features/role-brief/domain/types";
import {
  approveCandidates,
  chooseExecutionMode,
  createRecruitingWorkflow,
  recordCalibrationVerdict,
  startSourcing,
} from "../domain/workflow";
import type { CalibrationFeedback, ExecutionMode } from "../domain/types";
import {
  SqliteRecruitingWorkflowRepository,
  type StoredRecruitingWorkflow,
} from "../data/sqlite-recruiting-workflow-repository";
import type { CandidateDataSource } from "../providers/contracts";
import { MockCandidateDataSource } from "../providers/mock-candidate-data-source";

export class RecruitingWorkflowNotFoundError extends Error {
  constructor() {
    super("未找到招聘流程。");
  }
}

export class RecruitingWorkflowService {
  constructor(
    private readonly repository = new SqliteRecruitingWorkflowRepository(),
    private readonly candidates: CandidateDataSource = new MockCandidateDataSource(),
  ) {}

  get(roleId: string) {
    return this.repository.get(roleId);
  }

  async initialize(role: RoleBrief) {
    const existing = this.repository.get(role.id);
    if (existing) return existing;

    const samples = await this.candidates.getCalibrationSamples(role, 3);
    if (samples.length !== 3) {
      throw new Error("虚拟候选人不足，无法开始三样本校准。");
    }
    return this.repository.create(
      createRecruitingWorkflow(
        role.id,
        samples.map((match) => match.candidate.id),
      ),
    );
  }

  calibrate(
    roleId: string,
    expectedVersion: number,
    input: Omit<CalibrationFeedback, "createdAt">,
  ) {
    const stored = this.require(roleId);
    const state = recordCalibrationVerdict(stored.state, input);
    return this.persist(stored, state, expectedVersion, "calibration_feedback");
  }

  chooseMode(roleId: string, expectedVersion: number, mode: ExecutionMode) {
    const stored = this.require(roleId);
    const state = chooseExecutionMode(stored.state, mode);
    return this.persist(stored, state, expectedVersion, "execution_mode_selected");
  }

  async runSearch(role: RoleBrief, expectedVersion: number) {
    const stored = this.require(role.id);
    const page = await this.candidates.search(role, "0", 100);
    const state = startSourcing(stored.state, {
      screen: Math.max(100, page.total),
      match: page.items.length,
      candidateIds: page.items.map((match) => match.candidate.id),
    });
    return this.persist(stored, state, expectedVersion, "sourcing_completed");
  }

  approve(roleId: string, expectedVersion: number, candidateIds: string[]) {
    const stored = this.require(roleId);
    const state = approveCandidates(stored.state, candidateIds);
    return this.persist(stored, state, expectedVersion, "candidates_approved");
  }

  private require(roleId: string) {
    const stored = this.repository.get(roleId);
    if (!stored) throw new RecruitingWorkflowNotFoundError();
    return stored;
  }

  private persist(
    stored: StoredRecruitingWorkflow,
    state: StoredRecruitingWorkflow["state"],
    expectedVersion: number,
    action: string,
  ) {
    return this.repository.update(
      { state, version: stored.version },
      expectedVersion,
      action,
    );
  }
}

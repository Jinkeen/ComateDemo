import type {
  CalibrationFeedback,
  ExecutionMode,
  RecruitingWorkflowState,
} from "./types";

const timestamp = () => new Date().toISOString();

export function createRecruitingWorkflow(
  roleId: string,
  sampleIds: string[],
): RecruitingWorkflowState {
  if (sampleIds.length !== 3 || new Set(sampleIds).size !== 3) {
    throw new Error("样本校准必须包含三位不同的候选人。");
  }

  return {
    roleId,
    stage: "calibration_samples",
    criteriaVersion: 1,
    calibration: {
      sampleIds,
      activeIndex: 0,
      feedback: [],
    },
    executionMode: null,
    sourcing: {
      status: "idle",
      screen: 0,
      match: 0,
      candidateIds: [],
      error: null,
    },
    selection: {
      selectedIds: [],
      approvedIds: [],
    },
    outreach: {},
    interview: null,
    updatedAt: timestamp(),
  };
}

export function recordCalibrationVerdict(
  state: RecruitingWorkflowState,
  input: Omit<CalibrationFeedback, "createdAt">,
): RecruitingWorkflowState {
  if (state.stage !== "calibration_samples") {
    throw new Error("当前不在样本校准阶段。");
  }

  const expectedId = state.calibration.sampleIds[state.calibration.activeIndex];
  if (input.candidateId !== expectedId) {
    throw new Error("只能评价当前样本。");
  }

  const evidence = input.evidence.trim();
  if (!evidence) {
    throw new Error("请填写判断依据。");
  }

  const feedback = [
    ...state.calibration.feedback,
    { ...input, evidence, createdAt: timestamp() },
  ];
  const complete = feedback.length === state.calibration.sampleIds.length;

  return {
    ...state,
    stage: complete ? "execution_mode" : state.stage,
    criteriaVersion: state.criteriaVersion + 1,
    calibration: {
      ...state.calibration,
      activeIndex: Math.min(feedback.length, state.calibration.sampleIds.length - 1),
      feedback,
    },
    updatedAt: timestamp(),
  };
}

export function chooseExecutionMode(
  state: RecruitingWorkflowState,
  mode: ExecutionMode,
): RecruitingWorkflowState {
  if (state.stage !== "execution_mode") {
    throw new Error("请先完成三位样本校准。");
  }

  return {
    ...state,
    stage: "sourcing_run",
    executionMode: mode,
    updatedAt: timestamp(),
  };
}

export function startSourcing(
  state: RecruitingWorkflowState,
  result: { screen: number; match: number; candidateIds: string[] },
): RecruitingWorkflowState {
  if (state.stage !== "sourcing_run") {
    throw new Error("当前无法启动完整搜索。");
  }
  if (result.match !== result.candidateIds.length || result.match > result.screen) {
    throw new Error("候选人漏斗计数不一致。");
  }

  return {
    ...state,
    stage: "candidate_approval",
    sourcing: {
      status: "awaiting_review",
      ...result,
      error: null,
    },
    updatedAt: timestamp(),
  };
}

export function approveCandidates(
  state: RecruitingWorkflowState,
  selectedIds: string[],
): RecruitingWorkflowState {
  if (state.stage !== "candidate_approval") {
    throw new Error("当前没有待审批候选人。");
  }
  if (selectedIds.length === 0) {
    throw new Error("请至少选择一位候选人。");
  }

  const allowed = new Set(state.sourcing.candidateIds);
  const uniqueIds = [...new Set(selectedIds)];
  if (uniqueIds.some((candidateId) => !allowed.has(candidateId))) {
    throw new Error("选择中包含不在审批队列的候选人。");
  }

  return {
    ...state,
    stage: "completed",
    selection: {
      selectedIds: uniqueIds,
      approvedIds: uniqueIds,
    },
    updatedAt: timestamp(),
  };
}

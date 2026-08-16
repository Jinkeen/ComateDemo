export type RecruitingStage =
  | "calibration_samples"
  | "execution_mode"
  | "sourcing_run"
  | "candidate_approval"
  | "simulated_outreach"
  | "simulated_interview"
  | "completed";

export type CalibrationVerdict = "good_fit" | "maybe" | "not_a_fit";
export type ExecutionMode = "manual" | "automatic";
export type SourcingStatus =
  | "idle"
  | "queued"
  | "searching"
  | "scoring"
  | "awaiting_review"
  | "completed"
  | "failed";
export type OutreachStatus =
  | "waiting_contact"
  | "simulated_sent"
  | "simulated_unread"
  | "simulated_opened"
  | "failed"
  | "simulated_interested";

export interface CalibrationFeedback {
  candidateId: string;
  verdict: CalibrationVerdict;
  evidence: string;
  createdAt: string;
}

export interface RecruitingWorkflowState {
  roleId: string;
  stage: RecruitingStage;
  criteriaVersion: number;
  calibration: {
    sampleIds: string[];
    activeIndex: number;
    feedback: CalibrationFeedback[];
  };
  executionMode: ExecutionMode | null;
  sourcing: {
    status: SourcingStatus;
    screen: number;
    match: number;
    candidateIds: string[];
    error: string | null;
  };
  selection: {
    selectedIds: string[];
    approvedIds: string[];
  };
  outreach: Record<string, OutreachStatus>;
  interview: {
    candidateId: string;
    startsAt: string;
  } | null;
  updatedAt: string;
}

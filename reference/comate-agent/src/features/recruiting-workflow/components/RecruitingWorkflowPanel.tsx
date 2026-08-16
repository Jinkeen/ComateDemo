"use client";

import { useEffect } from "react";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import type { StoredRecruitingWorkflow } from "../data/sqlite-recruiting-workflow-repository";
import { useRecruitingWorkflow } from "../hooks/useRecruitingWorkflow";
import { CalibrationStage } from "./CalibrationStage";
import { CandidateApprovalStage } from "./CandidateApprovalStage";
import { ExecutionModeStage } from "./ExecutionModeStage";
import { SourcingRunStage } from "./SourcingRunStage";

export function workflowDisplayStep(workflow: StoredRecruitingWorkflow | null) {
  if (!workflow) return 4;
  const { state } = workflow;
  if (state.stage === "calibration_samples") return 6 + Math.min(state.calibration.activeIndex, 2);
  if (state.stage === "execution_mode") return 9;
  if (state.stage === "sourcing_run") return 10;
  return 11;
}

function candidateQueue(candidates: CandidateMatch[], ids: string[]) {
  const byId = new Map(candidates.map((match) => [match.candidate.id, match]));
  return ids.flatMap((id) => {
    const candidate = byId.get(id);
    return candidate ? [candidate] : [];
  });
}

export function RecruitingWorkflowPanel({ roleId, initialWorkflow, onStepChange }: { roleId: string; initialWorkflow: StoredRecruitingWorkflow | null; onStepChange?: (step: number) => void }) {
  const { workflow, candidates, error, isPending, mutate } = useRecruitingWorkflow(roleId, initialWorkflow);

  useEffect(() => {
    onStepChange?.(workflowDisplayStep(workflow));
  }, [onStepChange, workflow]);

  if (!workflow) return <section className="nw-task-card nw-loading-card"><p role="status">正在准备三份虚拟候选人校准样本…</p>{error ? <p className="rh-inline-error" role="alert">{error}</p> : null}</section>;
  const { state } = workflow;

  return (
    <div className="nw-workflow-panel">
      {error ? <p className="rh-inline-error" role="alert">{error}</p> : null}
      {state.stage === "calibration_samples" ? (() => {
        const sample = candidateQueue(candidates, [state.calibration.sampleIds[state.calibration.activeIndex]])[0];
        return sample ? <CalibrationStage candidate={sample} disabled={isPending} index={state.calibration.activeIndex} key={sample.candidate.id} total={state.calibration.sampleIds.length} onSubmit={(input) => void mutate({ action: "calibrate", ...input })} /> : <section className="nw-task-card nw-loading-card"><p role="status">正在加载当前校准样本…</p></section>;
      })() : null}
      {state.stage === "execution_mode" ? <ExecutionModeStage disabled={isPending} onSelect={(mode) => void mutate({ action: "choose_mode", mode })} /> : null}
      {state.stage === "sourcing_run" ? <SourcingRunStage disabled={isPending} sourcing={state.sourcing} onRun={() => void mutate({ action: "run_search" })} /> : null}
      {state.stage === "candidate_approval" ? <CandidateApprovalStage candidates={candidateQueue(candidates, state.sourcing.candidateIds)} disabled={isPending} pageSize={8} onApprove={(candidateIds) => void mutate({ action: "approve", candidateIds })} /> : null}
      {state.stage === "completed" ? <section className="nw-task-card nw-complete-stage"><span>✓</span><p className="nw-eyebrow">筛选流程完成</p><h2>已确认 {state.selection.approvedIds.length} 位候选人</h2><p>岗位澄清、样本校准、完整搜索与候选人审批已完成。后续面试安排由其他成员模块负责。</p></section> : null}
    </div>
  );
}

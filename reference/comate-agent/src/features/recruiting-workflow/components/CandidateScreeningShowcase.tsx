"use client";

import { useMemo } from "react";
import { seedCandidates } from "@/features/candidates/data/seed-candidates";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import { CandidateApprovalStage } from "./CandidateApprovalStage";

/** Single-page screening showcase used while the full workflow is still in progress. */
export function CandidateScreeningShowcase() {
  const candidates = useMemo<CandidateMatch[]>(() => seedCandidates.map((candidate, index) => ({
    candidate,
    score: Math.max(68, 92 - index * 4),
    reasons: index === 0 ? ["AI 产品设计", "大模型应用"] : candidate.skills.slice(0, 2),
    gaps: [],
  })), []);
  return <CandidateApprovalStage candidates={candidates} disabled={false} onApprove={() => undefined} pageSize={5} />;
}

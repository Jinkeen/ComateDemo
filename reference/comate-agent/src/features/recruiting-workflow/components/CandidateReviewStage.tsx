"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getReviewCandidates } from "@/features/candidates/data/candidate-match-factory";
import type { CalibrationVerdict } from "../domain/types";
import { CandidateResumeDetail } from "./CandidateResumeDetail";
import { CandidateReviewPanel } from "./CandidateReviewPanel";

interface CandidateReviewStageProps {
  roleId: string;
  candidateId?: string | null;
  onFeedbackChange?: (results: ReviewResult[]) => void;
}

export interface ReviewResult {
  candidateId: string;
  verdict: CalibrationVerdict;
  evidence: string;
}

export function CandidateReviewStage({
  roleId,
  candidateId,
  onFeedbackChange,
}: CandidateReviewStageProps) {
  const router = useRouter();
  const candidates = useMemo(() => getReviewCandidates(), []);
  const initialIndex = Math.max(0, candidates.findIndex((item) => item.candidate.id === candidateId));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const current = candidates[currentIndex] ?? candidates[0];

  function handleVerdict(result: ReviewResult) {
    const nextResults = [...results.filter((item) => item.candidateId !== result.candidateId), result];
    setResults(nextResults);
    onFeedbackChange?.(nextResults);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= candidates.length) {
      router.replace(`/hire/role/${roleId}?view=create`, { scroll: false });
      return;
    }
    setCurrentIndex(nextIndex);
    router.replace(`/hire/role/${roleId}?view=screening&mode=review&candidate=${candidates[nextIndex].candidate.id}`, { scroll: false });
  }

  return (
    <section className="candidate-review-workspace" aria-label="候选人样本评审">
      <CandidateReviewPanel
        index={currentIndex}
        match={current}
        onVerdict={handleVerdict}
        total={candidates.length}
      />
      <CandidateResumeDetail match={current} />
    </section>
  );
}

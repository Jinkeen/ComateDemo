"use client";

import { buildConversationItems } from "../domain/presentation";
import type { QuestionId, RoleBrief } from "../domain/types";
import { ClarificationTranscript } from "./ClarificationTranscript";
import { RoleBriefSummaryCard } from "./RoleBriefSummaryCard";

interface BriefReviewProps {
  role: RoleBrief;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onConfirm: () => void;
  onRevisit: (questionId: QuestionId) => void;
}

export function BriefReview({
  role,
  isSubmitting,
  onPrevious,
  onConfirm,
  onRevisit,
}: BriefReviewProps) {
  const transcript = buildConversationItems(role);

  return (
    <section className="rh-brief-review">
      {transcript.length ? (
        <ClarificationTranscript items={transcript} onRevisit={onRevisit} />
      ) : null}

      <RoleBriefSummaryCard
        isSubmitting={isSubmitting}
        role={role}
        onBack={onPrevious}
        onConfirm={onConfirm}
        onEdit={onRevisit}
      />
    </section>
  );
}

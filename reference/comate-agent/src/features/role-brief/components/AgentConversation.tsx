"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useId, useState } from "react";
import { buildConversationItems, resolveClarificationTransition } from "../domain/presentation";
import { recommendationTransition } from "../domain/questions";
import type { AnswerSource, ClarificationQuestion, QuestionId, RoleBrief } from "../domain/types";
import { AgentTransition } from "./AgentTransition";
import { ClarificationTranscript } from "./ClarificationTranscript";
import { CurrentQuestionCard } from "./CurrentQuestionCard";
import { RoleBriefSummaryCard } from "./RoleBriefSummaryCard";
import { CandidateRecommendationStage } from "@/features/recruiting-workflow/components/CandidateRecommendationStage";
import { RecalibrationActionCard } from "@/features/recruiting-workflow/components/RecalibrationActionCard";
import { buildRecalibrationTransition } from "@/features/recruiting-workflow/domain/calibration-narrative";
import type { CalibrationFeedback } from "@/features/recruiting-workflow/domain/types";

interface AgentConversationProps {
  roleId: string;
  role: RoleBrief;
  question?: ClarificationQuestion | null;
  agentSummary?: string | null;
  isSubmitting?: boolean;
  onAnswer: (questionId: QuestionId, value: string, source?: AnswerSource) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onRevisit: (questionId: QuestionId) => void;
  onConfirm?: () => void;
  calibrationFeedback?: Array<Pick<CalibrationFeedback, "verdict" | "evidence">>;
}

export function AgentConversation({
  roleId,
  role,
  question,
  agentSummary,
  isSubmitting,
  onAnswer,
  onSkip,
  onPrevious,
  onRevisit,
  onConfirm,
  calibrationFeedback = [],
}: AgentConversationProps) {
  const [isRoleBriefExpanded, setIsRoleBriefExpanded] = useState(false);
  const roleBriefDescriptionId = useId();
  const showSummary = !question;
  const transcript = buildConversationItems(role, question?.id);
  const existingAnswer = question
    ? role.answers.find((item) => item.questionId === question.id)?.rawValue ?? ""
    : "";
  const transition = showSummary
    ? agentSummary || "已根据本轮澄清整理职位摘要，可直接修改任一项后继续确认。"
    : resolveClarificationTransition(role, question);
  const showRecalibration = role.lifecycleState === "confirmed" && calibrationFeedback.length >= 3;

  return (
    <section className={`rh-conversation${showSummary ? " is-reviewing" : ""}`}>
      <article className="rh-role-brief">
        <span className="rh-role-brief-icon" aria-hidden="true">
          <FileText size={16} strokeWidth={2.2} />
        </span>
        <div className="rh-role-brief-content">
          <div className="rh-role-brief-heading">
            <p>职位原始需求</p>
          </div>
          <div
            className={`rh-role-brief-description${isRoleBriefExpanded ? " is-expanded" : ""}`}
            id={roleBriefDescriptionId}
          >
            {role.originalDescription}
          </div>
          <button
            aria-controls={roleBriefDescriptionId}
            aria-expanded={isRoleBriefExpanded}
            className="rh-role-brief-toggle"
            onClick={() => setIsRoleBriefExpanded((expanded) => !expanded)}
            type="button"
          >
            {isRoleBriefExpanded ? "收起" : "展开"}
            <ChevronDown aria-hidden="true" size={15} strokeWidth={2} />
          </button>
        </div>
      </article>

      {transcript.length ? (
        <ClarificationTranscript
          activeQuestionId={question?.id}
          items={transcript}
          onRevisit={onRevisit}
        />
      ) : null}

      {transition ? <AgentTransition>{transition}</AgentTransition> : null}

      {question ? (
        <CurrentQuestionCard
          existingAnswer={existingAnswer}
          question={question}
          role={role}
          onAnswer={onAnswer}
          onPrevious={onPrevious}
          onSkip={onSkip}
        />
      ) : (
        <>
          <RoleBriefSummaryCard
            isSubmitting={isSubmitting}
            role={role}
            onBack={onPrevious}
            onConfirm={onConfirm ?? (() => undefined)}
            onEdit={onRevisit}
          />
          {role.lifecycleState === "confirmed" ? (
            <>
              <AgentTransition>{recommendationTransition}</AgentTransition>
              <CandidateRecommendationStage roleId={roleId} variant="inline" />
              {showRecalibration ? (
                <>
                  <AgentTransition>{buildRecalibrationTransition(calibrationFeedback)}</AgentTransition>
                  <RecalibrationActionCard roleId={roleId} />
                </>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

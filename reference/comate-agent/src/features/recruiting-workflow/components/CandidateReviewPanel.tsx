"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import type { CalibrationVerdict } from "../domain/types";

const verdicts: Array<{
  value: CalibrationVerdict;
  label: string;
  hint: string;
}> = [
  { value: "good_fit", label: "适合", hint: "符合当前候选人画像" },
  { value: "maybe", label: "待确认", hint: "部分条件需要进一步核实" },
  { value: "not_a_fit", label: "不适合", hint: "不符合岗位关键要求" },
];

interface CandidateReviewPanelProps {
  match: CandidateMatch;
  index: number;
  total: number;
  onVerdict: (input: {
    candidateId: string;
    verdict: CalibrationVerdict;
    evidence: string;
  }) => void;
}

export function CandidateReviewPanel({
  match,
  index,
  total,
  onVerdict,
}: CandidateReviewPanelProps) {
  const [evidence, setEvidence] = useState("");
  const [submittedNote, setSubmittedNote] = useState<string | null>(null);
  const candidate = match.candidate;
  const displayName = candidate.name.replace(/（虚构）/g, "");

  useEffect(() => {
    setEvidence("");
    setSubmittedNote(null);
  }, [candidate.id]);

  function handleComposerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = evidence.trim();
    if (!trimmed) return;
    setSubmittedNote(trimmed);
    setEvidence("");
  }

  function resolveEvidence(fallback: string) {
    return submittedNote ?? (evidence.trim() || fallback);
  }

  return (
    <section className="candidate-review-panel" aria-labelledby="candidate-review-title">
      <header>
        <button aria-label="返回职位摘要" onClick={() => history.back()} type="button">←</button>
        <div>
          <h1 id="candidate-review-title">评审样本 {index + 1} / {total}</h1>
          <span><i style={{ width: `${((index + 1) / total) * 100}%` }} /></span>
        </div>
      </header>

      <div className="candidate-review-panel-body">
        <div className="candidate-review-ai-copy">
          <p>我将展示三位候选人样本，以了解你的筛选偏好。</p>
          <p>
            当前候选人是 <strong>{displayName}</strong>，拥有 {candidate.yearsOfExperience} 年
            {candidate.title}相关经验。其核心能力包括{candidate.skills.slice(0, 3).join("、")}。
          </p>
          <p>{candidate.summary}</p>
        </div>

        <div className="candidate-review-question">
          <h2>你认为这位候选人是否适合该岗位？</h2>
          <div aria-label="候选人适配判断">
            {verdicts.map((item) => (
              <button
                aria-label={`${item.label}：${item.hint}`}
                key={item.value}
                onClick={() => onVerdict({
                  candidateId: candidate.id,
                  verdict: item.value,
                  evidence: resolveEvidence(item.hint),
                })}
                type="button"
              >
                <b>{item.label}</b>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="candidate-review-reason">
          <h2>请补充判断原因</h2>
          {submittedNote ? (
            <p className="candidate-review-submitted-note">{submittedNote}</p>
          ) : (
            <p className="candidate-review-reason-hint">AI 会据此调整后续候选人的筛选偏好。</p>
          )}
        </div>
      </div>

      <form className="candidate-review-composer" onSubmit={handleComposerSubmit}>
        <input
          aria-label="补充候选人判断原因"
          onChange={(event) => setEvidence(event.target.value)}
          placeholder="告诉 AI 你对这位候选人的看法"
          value={evidence}
        />
        <button aria-label="保存判断原因" disabled={!evidence.trim()} type="submit">
          <ArrowUp aria-hidden="true" size={18} />
        </button>
      </form>
    </section>
  );
}

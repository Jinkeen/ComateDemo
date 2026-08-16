"use client";

import { useState } from "react";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import type { CalibrationVerdict } from "../domain/types";

interface CalibrationStageProps {
  candidate: CandidateMatch;
  index: number;
  total: number;
  disabled?: boolean;
  onSubmit: (input: { candidateId: string; verdict: CalibrationVerdict; evidence: string }) => void;
}

const verdicts: Array<{ value: CalibrationVerdict; label: string; description: string }> = [
  { value: "good_fit", label: "Good fit", description: "符合当前画像" },
  { value: "maybe", label: "Maybe", description: "需要进一步确认" },
  { value: "not_a_fit", label: "Not a fit", description: "不符合关键要求" },
];

export function CalibrationStage({ candidate, index, total, disabled = false, onSubmit }: CalibrationStageProps) {
  const [verdict, setVerdict] = useState<CalibrationVerdict | null>(null);
  const [evidence, setEvidence] = useState("");

  return (
    <section className="nw-task-card nw-calibration-stage">
      <header className="nw-task-card-header">
        <div><span>校准样本 {index + 1} / {total}</span><small>请判断并说明依据，AI 将据此修正搜索偏好</small></div>
        <b>{candidate.score}<small>分</small></b>
      </header>
      <div className="nw-candidate-title">
        <div><h2>{candidate.candidate.name}</h2><p>{candidate.candidate.title} · {candidate.candidate.yearsOfExperience} 年经验</p></div>
        <span>{candidate.candidate.location}</span>
      </div>
      <p className="nw-candidate-summary">{candidate.candidate.summary}</p>
      <div className="nw-evidence-grid">
        <div><h3>匹配依据</h3>{candidate.reasons.map((reason) => <p key={reason}>{reason}</p>)}</div>
        <div><h3>待确认差距</h3>{candidate.gaps.length ? candidate.gaps.map((gap) => <p key={gap}>{gap}</p>) : <p>暂无明显差距</p>}</div>
      </div>
      <div className="nw-verdict-list" aria-label="样本判断">
        {verdicts.map((item) => <button aria-label={item.label} className={verdict === item.value ? "is-selected" : ""} key={item.value} onClick={() => setVerdict(item.value)} type="button"><b>{item.label}</b><span>{item.description}</span></button>)}
      </div>
      <label className="nw-feedback-field">判断依据<textarea aria-label="判断依据" required value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="例如：具备大模型 B 端产品落地经验，但团队管理范围需进一步确认。" /></label>
      <footer><span>提交后进入下一份样本</span><button className="nw-primary-action" disabled={disabled || !verdict || !evidence.trim()} onClick={() => verdict && onSubmit({ candidateId: candidate.candidate.id, verdict, evidence: evidence.trim() })} type="button">提交判断</button></footer>
    </section>
  );
}

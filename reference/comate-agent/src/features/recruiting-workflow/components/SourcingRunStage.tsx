import type { RecruitingWorkflowState } from "../domain/types";

export function SourcingRunStage({ sourcing, disabled = false, onRun }: { sourcing: RecruitingWorkflowState["sourcing"]; disabled?: boolean; onRun: () => void }) {
  const waiting = sourcing.status === "awaiting_review";
  const active = ["queued", "searching", "scoring"].includes(sourcing.status);
  return (
    <section className="nw-task-card nw-sourcing-stage">
      <p className="nw-eyebrow">完整搜索</p>
      <h2>从校准偏好生成候选人队列</h2>
      <p className="nw-stage-lead">按“召回 → 评分 → 人工确认”的顺序展示实时漏斗，不自动联系任何候选人。</p>
      <div className="nw-funnel">
        <div><strong>{sourcing.screen}</strong><span>Screen</span><small>初步召回</small></div>
        <div><strong>{sourcing.match}</strong><span>Match</span><small>满足画像</small></div>
        <div><strong>0</strong><span>Contact</span><small>待批准</small></div>
        <div><strong>0</strong><span>Interested</span><small>待回复</small></div>
        <div><strong>0</strong><span>Interview</span><small>待排期</small></div>
      </div>
      {sourcing.status === "idle" ? <button className="nw-primary-action" disabled={disabled} onClick={onRun} type="button">开始完整搜索</button> : <p className={`nw-run-status ${waiting ? "is-ready" : ""}`} role="status">{waiting ? "等待人工审批" : active ? "正在生成候选人队列" : sourcing.status === "failed" ? sourcing.error || "搜索失败" : "候选人队列已生成"}</p>}
    </section>
  );
}

import type { ExecutionMode } from "../domain/types";

export function ExecutionModeStage({ disabled = false, onSelect }: { disabled?: boolean; onSelect: (mode: ExecutionMode) => void }) {
  return (
    <section className="nw-task-card nw-mode-stage">
      <p className="nw-eyebrow">外联模式选择</p>
      <h2>校准完成，选择候选人推进方式</h2>
      <p className="nw-stage-lead">两种模式均使用虚拟数据。本原型不会发送真实消息，也不会创建真实日历事件。</p>
      <div className="nw-mode-grid">
        <button disabled={disabled} onClick={() => onSelect("manual")} type="button"><span>推荐</span><h3>人工审核模式</h3><p>先查看完整搜索漏斗，再选择候选人并批准模拟触达。</p><b>选择人工审核</b></button>
        <button disabled={disabled} onClick={() => onSelect("automatic")} type="button"><span>自动化边界演示</span><h3>自动推进模式</h3><p>仍保留最终名单确认，所有外联和排期保持模拟。</p><b>选择自动推进</b></button>
      </div>
    </section>
  );
}

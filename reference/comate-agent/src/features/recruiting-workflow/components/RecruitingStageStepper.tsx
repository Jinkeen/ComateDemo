import { Check } from "lucide-react";

export const recruitingDisplayStages = [
  "岗位输入与语义解析",
  "AI 多轮需求澄清",
  "画像汇总与搜索确认",
  "职位简报与任务承接",
  "候选人推进与面试日历",
  "分层召回与样本生成",
  "候选人详情与匹配解释",
  "结构化反馈与偏好学习",
  "外联模式选择",
  "完整搜索与实时漏斗",
  "候选名单审批与触达",
] as const;

export function RecruitingStageStepper({ currentStep }: { currentStep: number }) {
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), recruitingDisplayStages.length);

  return (
    <section className="nw-progress nw-float-card" aria-labelledby="nw-progress-title">
      <div className="nw-rail-heading">
        <h2 id="nw-progress-title">招聘进展</h2>
        <span>{safeCurrentStep}/11</span>
      </div>
      <ol aria-label="招聘流程">
        {recruitingDisplayStages.map((label, index) => {
          const step = index + 1;
          const status = step < safeCurrentStep ? "complete" : step === safeCurrentStep ? "current" : "upcoming";
          return (
            <li className={`is-${status}`} key={label}>
              <i aria-hidden="true">
                {status === "complete" ? <Check size={11} strokeWidth={2.6} /> : status === "upcoming" ? step : null}
              </i>
              <span aria-current={status === "current" ? "step" : undefined}>{label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

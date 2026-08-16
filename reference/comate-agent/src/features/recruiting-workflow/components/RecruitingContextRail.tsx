import type { RoleBrief } from "@/features/role-brief/domain/types";
import { RecruitingStageStepper } from "./RecruitingStageStepper";

function summarizeCriteria(role: RoleBrief) {
  return [
    { label: "地区", value: role.location || "待确认" },
    { label: "经验", value: role.seniority || "待确认" },
    { label: "核心要求", value: role.mustHaves[0] || "待确认" },
  ];
}

export function RecruitingContextRail({ role, currentStep }: { role: RoleBrief; currentStep: number }) {
  return (
    <aside className="nw-context-rail" aria-label="招聘进展与搜索标准">
      <RecruitingStageStepper currentStep={currentStep} />
      <section className="nw-criteria-summary nw-float-card" aria-labelledby="nw-criteria-title">
        <div className="nw-rail-heading">
          <h2 id="nw-criteria-title">搜索标准</h2>
          <span>v{role.criteriaVersion}</span>
        </div>
        <p className="nw-criteria-role">{role.title}</p>
        <dl>
          {summarizeCriteria(role).map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <details>
          <summary>查看完整标准</summary>
          <div className="nw-criteria-detail">
            <p><span>工作方式</span>{role.workModel || "待确认"}</p>
            <p><span>领域</span>{role.domain || "待确认"}</p>
            <p><span>核心要求</span>{role.mustHaves.join("、") || "待确认"}</p>
            <p><span>排除项</span>{role.exclusions.join("、") || "无"}</p>
          </div>
        </details>
      </section>
      <p className="nw-simulation-note">虚拟数据模式</p>
    </aside>
  );
}

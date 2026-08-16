import { projectSearchCriteria } from "../domain/criteria";
import type { RoleBrief } from "../domain/types";

export function SearchCriteriaPanel({ role }: { role: RoleBrief }) {
  const criteria = projectSearchCriteria(role);
  const completedCriteria = criteria.filter((item) => item.complete);
  const pendingCriteria = criteria.filter((item) => !item.complete);

  return (
    <section className="rh-criteria nw-float-card" aria-label="搜索标准">
      <div className="rh-panel-heading"><h2>搜索标准</h2><span>v{role.criteriaVersion}</span></div>
      <div className="rh-criteria-group"><h3>角色基础</h3><p className="rh-role-name">{role.title}</p>{completedCriteria.slice(0, 3).map((item) => <div className="rh-criterion" key={item.id}><span>{item.label}</span><b>{item.value}</b></div>)}</div>
      <div className="rh-criteria-group"><h3>必备内容</h3>{role.mustHaves.length ? <div className="rh-tags">{role.mustHaves.map((item) => <span key={item}>{item}</span>)}</div> : <p className="rh-pending">等待关键能力要求</p>}</div>
      {(role.exclusions.length || role.domain || role.education) ? <div className="rh-criteria-group"><h3>偏好与限制</h3>{role.domain ? <div className="rh-criterion"><span>领域</span><b>{role.domain}</b></div> : null}{role.education ? <div className="rh-criterion"><span>学历</span><b>{role.education}</b></div> : null}{role.exclusions.length ? <div className="rh-tags">{role.exclusions.map((item) => <span key={item}>{item}</span>)}</div> : null}</div> : null}
      {pendingCriteria.length ? <p className="rh-pending">待补充：{pendingCriteria.slice(0, 3).map((item) => item.label).join("、")}</p> : null}
    </section>
  );
}

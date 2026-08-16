import type { RoleBrief } from "@/features/role-brief/domain/types";
import { seedCandidates } from "../data/seed-candidates";
import type { CandidateMatch, CandidateProfile } from "../domain/types";

function includesLoose(values: string[], expected?: string): boolean {
  return !expected || expected === "不限" || values.some((value) => value.includes(expected) || expected.includes(value));
}

function scoreCandidate(candidate: CandidateProfile, role: RoleBrief): CandidateMatch | null {
  const mustHaves = role.mustHaves.filter((item) => item && item !== "不限");
  const missingMustHaves = mustHaves.filter((skill) => !candidate.skills.some((candidateSkill) => candidateSkill.includes(skill) || skill.includes(candidateSkill)));
  if (missingMustHaves.length) return null;
  if (role.exclusions.some((exclusion) => candidate.summary.includes(exclusion))) return null;
  const reasons: string[] = mustHaves.map((skill) => `具备必备能力：${skill}`);
  const gaps: string[] = [];
  let score = Math.min(45, mustHaves.length * 15);
  if (role.seniority && candidate.seniority === role.seniority) { score += 20; reasons.push("职级匹配"); } else if (role.seniority) gaps.push(`职级为${candidate.seniority}`);
  if (role.location && (candidate.location === role.location || candidate.location === "远程优先")) { score += 10; reasons.push("地点可覆盖"); } else if (role.location) gaps.push("地点需进一步确认");
  if (includesLoose(candidate.workModels, role.workModel)) { score += 5; reasons.push("工作方式匹配"); } else if (role.workModel) gaps.push("工作方式待确认");
  if (includesLoose(candidate.domains, role.domain)) { score += 10; reasons.push("行业背景匹配"); }
  if (role.education && role.education !== "不限") gaps.push("学历信息未纳入虚构库评分");
  return { candidate, score: Math.min(100, score), reasons, gaps };
}

export function searchCandidates(role: RoleBrief): CandidateMatch[] {
  return seedCandidates.map((candidate) => scoreCandidate(candidate, role)).filter((value): value is CandidateMatch => value !== null).sort((left, right) => right.score - left.score || left.candidate.id.localeCompare(right.candidate.id));
}

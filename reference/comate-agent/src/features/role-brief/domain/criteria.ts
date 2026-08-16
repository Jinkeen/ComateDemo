import { createAnonymousCompanyProfile } from "./anonymous-company";
import type { RoleBrief } from "./types";

export interface SearchCriterion {
  id: string;
  label: string;
  value: string;
  complete: boolean;
}

function pending(value?: string): string {
  return value || "等待补充";
}

export function projectSearchCriteria(role: RoleBrief): SearchCriterion[] {
  return [
    { id: "location", label: "地点", value: pending(role.location), complete: Boolean(role.location) },
    { id: "workModel", label: "方式", value: pending(role.workModel), complete: Boolean(role.workModel) },
    { id: "seniority", label: "职级", value: pending(role.seniority), complete: Boolean(role.seniority) },
    {
      id: "mustHaves",
      label: "能力",
      value: role.mustHaves.length ? role.mustHaves.join("、") : "等待补充",
      complete: role.mustHaves.length > 0,
    },
  ];
}

export function companyDisplayForBrief(role: RoleBrief): string {
  const profile = createAnonymousCompanyProfile(role);

  if (profile) {
    return profile.positioning;
  }

  return role.companyCue || "未指定";
}

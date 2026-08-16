import type { AnonymousCompanyProfile, RoleBrief } from "./types";

export function createAnonymousCompanyProfile(
  role: RoleBrief,
): AnonymousCompanyProfile | undefined {
  if (role.companyVisibility !== "confidential") {
    return undefined;
  }

  const stage = role.companyStage || "成长阶段";
  const domain = role.companyDomain || "科技";

  return {
    stage,
    domain,
    positioning: "一家专注" + domain + "的" + stage + "团队",
  };
}

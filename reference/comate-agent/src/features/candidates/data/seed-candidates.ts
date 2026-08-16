import type { CandidateProfile } from "../domain/types";

const templates: Array<Omit<CandidateProfile, "id" | "name">> = [
  { title: "AI 产品经理", seniority: "高级", location: "远程优先", workModels: ["完全远程", "混合办公"], skills: ["AI 产品设计", "0-1 产品落地", "大模型应用", "跨团队协作"], domains: ["AI / SaaS", "企业服务"], yearsOfExperience: 6, summary: "负责过大模型产品从需求探索到上线迭代，擅长跨团队协作。" },
  { title: "产品经理", seniority: "中级", location: "中国大陆", workModels: ["混合办公", "全职坐班"], skills: ["AI 产品设计", "0-1 产品落地", "跨团队协作"], domains: ["互联网产品"], yearsOfExperience: 4, summary: "有 B 端产品交付和 AI 功能落地经验。" },
  { title: "AI 应用产品负责人", seniority: "负责人 / Lead", location: "新加坡", workModels: ["完全远程", "混合办公"], skills: ["AI 产品设计", "大模型应用", "跨团队协作"], domains: ["AI / SaaS", "企业服务"], yearsOfExperience: 9, summary: "带领团队建设企业级 AI 应用与评估体系。" },
  { title: "技术产品经理", seniority: "高级", location: "香港 / 台湾", workModels: ["完全远程"], skills: ["0-1 产品落地", "大模型应用", "跨团队协作"], domains: ["企业服务"], yearsOfExperience: 7, summary: "具备技术沟通能力，关注 AI 交付质量和可用性。" },
];

const names = ["林澈", "周宁", "陈星", "许言", "沈越", "方晴", "顾远", "陆川"];

export const seedCandidates: CandidateProfile[] = Array.from({ length: 24 }, (_, index) => {
  const template = templates[index % templates.length];
  return { ...template, id: `synthetic-${index + 1}`, name: `${names[index % names.length]}（虚构）`, yearsOfExperience: template.yearsOfExperience + (index % 3) };
});

export const allResumeCandidateCount = 284;

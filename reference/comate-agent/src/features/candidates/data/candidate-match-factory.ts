import type { CandidateMatch } from "../domain/types";
import { seedCandidates } from "./seed-candidates";

export function buildCandidateMatches(): CandidateMatch[] {
  return seedCandidates.map((candidate, index) => ({
    candidate,
    score: Math.max(68, 92 - index * 4),
    reasons: index === 0 ? ["AI 产品设计", "大模型应用"] : candidate.skills.slice(0, 2),
    gaps: index % 3 === 1 ? ["团队规模需要进一步确认"] : [],
  }));
}

export function getCandidateMatch(candidateId?: string | null): CandidateMatch {
  const matches = buildCandidateMatches();
  return matches.find((match) => match.candidate.id === candidateId) ?? matches[0];
}

export function getReviewCandidates(): CandidateMatch[] {
  return buildCandidateMatches().slice(0, 3);
}

import { searchCandidates } from "@/features/candidates/application/candidate-search-service";
import { seedCandidates } from "@/features/candidates/data/seed-candidates";
import type { CandidateMatch } from "@/features/candidates/domain/types";
import type { RoleBrief } from "@/features/role-brief/domain/types";
import type { CandidateDataSource, CandidatePage } from "./contracts";

function parseCursor(cursor?: string): number {
  if (!cursor) return 0;
  const offset = Number.parseInt(cursor, 10);
  return Number.isInteger(offset) && offset >= 0 ? offset : 0;
}

function addFallbackReason(match: CandidateMatch): CandidateMatch {
  return match.reasons.length > 0
    ? match
    : { ...match, reasons: ["用于校准搜索偏好的代表性虚拟样本"] };
}

export class MockCandidateDataSource implements CandidateDataSource {
  async search(
    role: RoleBrief,
    cursor?: string,
    pageSize = 8,
  ): Promise<CandidatePage> {
    const matches = searchCandidates(role).map(addFallbackReason);
    const offset = parseCursor(cursor);
    const safePageSize = Math.min(Math.max(pageSize, 1), 100);
    const items = matches.slice(offset, offset + safePageSize);
    const nextOffset = offset + items.length;

    return {
      items,
      nextCursor: nextOffset < matches.length ? String(nextOffset) : null,
      total: matches.length,
      source: "synthetic",
    };
  }

  async getById(candidateId: string) {
    return seedCandidates.find((candidate) => candidate.id === candidateId) ?? null;
  }

  async getCalibrationSamples(role: RoleBrief, count: number) {
    if (count < 1) return [];
    const primary = searchCandidates(role).map(addFallbackReason);
    if (primary.length >= count) return primary.slice(0, count);

    const seen = new Set(primary.map((match) => match.candidate.id));
    const fallbackRole = { ...role, mustHaves: [], exclusions: [] };
    const fallback = searchCandidates(fallbackRole)
      .filter((match) => !seen.has(match.candidate.id))
      .map(addFallbackReason);

    return [...primary, ...fallback].slice(0, count);
  }
}

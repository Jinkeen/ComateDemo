import type {
  CandidateMatch,
  CandidateProfile,
} from "@/features/candidates/domain/types";
import type { RoleBrief } from "@/features/role-brief/domain/types";
import type { OutreachStatus } from "../domain/types";

export interface CandidatePage {
  items: CandidateMatch[];
  nextCursor: string | null;
  total: number;
  source: "synthetic" | "real";
}

export interface CandidateDataSource {
  search(role: RoleBrief, cursor?: string, pageSize?: number): Promise<CandidatePage>;
  getById(candidateId: string): Promise<CandidateProfile | null>;
  getCalibrationSamples(role: RoleBrief, count: number): Promise<CandidateMatch[]>;
}

export interface OutreachProvider {
  execute(input: {
    roleId: string;
    candidateIds: string[];
  }): Promise<{
    statuses: Record<string, OutreachStatus>;
    externalSideEffect: boolean;
  }>;
}

export interface CalendarProvider {
  schedule(input: {
    roleId: string;
    candidateId: string;
    startsAt: string;
  }): Promise<{
    schedule: { candidateId: string; startsAt: string };
    externalSideEffect: boolean;
  }>;
}

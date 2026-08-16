export interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  seniority: string;
  location: string;
  workModels: string[];
  skills: string[];
  domains: string[];
  yearsOfExperience: number;
  summary: string;
}

export interface CandidateMatch {
  candidate: CandidateProfile;
  score: number;
  reasons: string[];
  gaps: string[];
}

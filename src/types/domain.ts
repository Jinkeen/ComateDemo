export type UserRole = 'recruiter' | 'candidate'
export type CandidateStage = 'screening' | 'interview' | 'completed'
export type FitLevel = 'strong' | 'possible' | 'low'

export interface Job { id: string; title: string; summary: string; mustHave: string[] }
export interface Candidate { id: string; name: string; title: string; tags: string[]; matchScore: number; fitLevel: FitLevel; stage: CandidateStage }
export interface Interview { id: string; candidateId: string; scheduledAt: string; status: 'pending' | 'confirmed' | 'completed' }
export interface AgentEvent { id: string; agent: string; action: string; status: 'running' | 'completed' | 'waiting'; createdAt: string }

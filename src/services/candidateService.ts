import { demoCandidates } from '../mocks/demoData'
import type { Candidate } from '../types/domain'

export interface CandidateService { list(jobId: string): Promise<Candidate[]>; get(id: string): Promise<Candidate | undefined> }
export const candidateService: CandidateService = {
  async list() { return Promise.resolve(demoCandidates) },
  async get(id) { return Promise.resolve(demoCandidates.find((candidate) => candidate.id === id)) },
}

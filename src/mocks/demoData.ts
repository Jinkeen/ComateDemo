import type { AgentEvent, Candidate, Interview, Job } from '../types/domain'

export const demoJob: Job = { id: 'job-ai-pm', title: 'AI 游戏助理产品与工程混合型', summary: '兼具 AI 产品判断与工程落地能力', mustHave: ['AI 产品经验', '工程协作能力', '复杂项目经历'] }
export const demoCandidates: Candidate[] = [
  { id: 'candidate-emma', name: 'Emma', title: '复合型视觉与品牌负责人', tags: ['团队管理', '视觉设计', 'AI 增效'], matchScore: 92, fitLevel: 'strong', stage: 'screening' },
  { id: 'candidate-zhou', name: '周宁', title: 'AI 产品经理', tags: ['大模型应用', 'B 端产品'], matchScore: 78, fitLevel: 'possible', stage: 'interview' },
]
export const demoInterviews: Interview[] = [{ id: 'interview-1', candidateId: 'candidate-zhou', scheduledAt: '2026-08-14T14:00:00+08:00', status: 'confirmed' }]
export const demoAgentEvents: AgentEvent[] = [{ id: 'event-1', agent: '人才评估 Agent', action: '已完成 12 份简历的岗位匹配分析', status: 'completed', createdAt: '2026-08-12T20:00:00+08:00' }]

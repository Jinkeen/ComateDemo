# Data Contracts

## Source of truth

Shared domain contracts live in `src/types/domain.ts`. Demo records live in `src/mocks/demoData.ts`. Components access candidate records through `src/services/candidateService.ts` so a future API adapter can replace the mock implementation.

## Core contracts

`Job` contains the role title, summary, and must have requirements. `Candidate` contains display information, extracted tags, match score, fit level, and process stage. `Interview` contains scheduling and status. `AgentEvent` records visible agent activity.

Stable unions:

```ts
type UserRole = 'recruiter' | 'candidate'
type CandidateStage = 'screening' | 'interview' | 'completed'
type FitLevel = 'strong' | 'possible' | 'low'
```

## Identifier and time rules

All entities use stable string IDs. Mock timestamps use ISO 8601 with an explicit timezone. Routes may use IDs such as `/recruiter/candidates/:candidateId`. Components must not use array indexes as persistent IDs.

## Service boundary

Feature components must obtain domain data from a service interface. The initial example is `CandidateService`. Future services should follow the same pattern for jobs, interviews, assessments, and agent events.

Async service methods return Promises even when backed by local mock data. UI code therefore keeps the same loading and error shape after backend integration.

## Change policy

Changes to shared contracts require a short team review because recruiter and candidate features consume the same records. Add optional fields only when a real page needs them. Avoid untyped objects, duplicated local interfaces, and `any`.

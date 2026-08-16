# Feishu-Aligned Recruiting Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing Nexus Hire routes into a persistent 11-stage recruiting workflow that visually follows the approved Feishu screenshots and runs end-to-end with replaceable virtual-data providers.

**Architecture:** Keep `/hire` and `/hire/role/[roleId]` as the only product routes. Extend the existing role workspace with a separate persisted `RecruitingWorkflowState`, expose workflow actions through one validated Route Handler, and keep all third-party concerns behind provider interfaces. Render every stage inside one fixed desktop shell with a 208px left navigation, flexible center stage, and 176px right status rail.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 plus existing global CSS, better-sqlite3, Zod, Vitest, Testing Library.

---

## File map

### Domain and application

- Create `src/features/recruiting-workflow/domain/types.ts`: workflow state, stage, calibration, sourcing, selection, outreach, and interview types.
- Create `src/features/recruiting-workflow/domain/workflow.ts`: pure transition functions and invariants.
- Create `src/features/recruiting-workflow/application/recruiting-workflow-service.ts`: orchestration across repository and providers.
- Create `src/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository.ts`: persisted workflow state with optimistic versioning.
- Modify `src/features/recruiting-agent/application/role-workspace-service.ts`: include the workflow snapshot after Brief confirmation.

### Provider boundary

- Create `src/features/recruiting-workflow/providers/contracts.ts`: candidate, AI, outreach, and calendar provider interfaces.
- Create `src/features/recruiting-workflow/providers/mock-candidate-data-source.ts`: virtual candidate paging and calibration samples.
- Create `src/features/recruiting-workflow/providers/simulated-outreach-provider.ts`: local deterministic outreach states.
- Create `src/features/recruiting-workflow/providers/simulated-calendar-provider.ts`: local deterministic interview slots.

### API

- Create `src/app/api/roles/[roleId]/workflow/route.ts`: GET workflow snapshot and POST validated actions.
- Modify `src/app/api/roles/[roleId]/candidates/route.ts`: delegate through `CandidateDataSource` and expose cursor metadata.

### UI

- Create `src/features/recruiting-workflow/components/RecruitingAppShell.tsx`: fixed three-column desktop frame.
- Create `src/features/recruiting-workflow/components/RecruitingStageStepper.tsx`: 11-stage header.
- Create `src/features/recruiting-workflow/components/RecruitingContextRail.tsx`: 176px status rail.
- Create `src/features/recruiting-workflow/components/CalibrationStage.tsx`: three-sample review and verdict branches.
- Create `src/features/recruiting-workflow/components/ExecutionModeStage.tsx`: manual/automatic mode choice.
- Create `src/features/recruiting-workflow/components/SourcingRunStage.tsx`: funnel and strategy timeline.
- Create `src/features/recruiting-workflow/components/CandidateApprovalStage.tsx`: paging, persistent selection, details, approval.
- Create `src/features/recruiting-workflow/components/OutreachStage.tsx`: simulated contact progression.
- Create `src/features/recruiting-workflow/components/InterviewStage.tsx`: simulated scheduling.
- Create `src/features/recruiting-workflow/hooks/useRecruitingWorkflow.ts`: workflow fetch and mutation client.
- Modify `src/features/role-brief/components/RoleBriefWorkspace.tsx`: render the correct stage in the shared shell.
- Modify `src/features/role-brief/components/RoleSidebar.tsx`: use the approved Feishu-aligned navigation proportions.
- Modify `src/app/globals.css`: approved spacing, alignment, fixed widths, stage component styles.

### Database and tests

- Modify `src/server/db/migrate.ts`: create `recruiting_workflows` and workflow event tables.
- Create `tests/recruiting-workflow/workflow.test.ts`: pure transition coverage.
- Create `tests/recruiting-workflow/providers.test.ts`: provider contract coverage.
- Create `tests/recruiting-workflow/repository.test.ts`: SQLite persistence and conflicts.
- Create `tests/recruiting-workflow/presentation.test.tsx`: shell and stage behavior.
- Create `tests/recruiting-workflow/api.test.ts`: API action validation and state progression.

---

### Task 1: Define the persistent 11-stage domain state

**Files:**
- Create: `src/features/recruiting-workflow/domain/types.ts`
- Create: `src/features/recruiting-workflow/domain/workflow.ts`
- Test: `tests/recruiting-workflow/workflow.test.ts`

- [ ] **Step 1: Write the failing stage-transition tests**

```ts
import { describe, expect, it } from "vitest";
import {
  approveCandidates,
  chooseExecutionMode,
  createRecruitingWorkflow,
  recordCalibrationVerdict,
  startSourcing,
} from "@/features/recruiting-workflow/domain/workflow";

describe("recruiting workflow", () => {
  it("starts at calibration after the Brief is confirmed", () => {
    const state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    expect(state.stage).toBe("calibration_samples");
    expect(state.calibration.activeIndex).toBe(0);
  });

  it("requires three verdicts before execution mode selection", () => {
    let state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    state = recordCalibrationVerdict(state, { candidateId: "a", verdict: "good_fit", evidence: "0-1 AI product" });
    state = recordCalibrationVerdict(state, { candidateId: "b", verdict: "maybe", evidence: "evaluation depth unclear" });
    state = recordCalibrationVerdict(state, { candidateId: "c", verdict: "not_a_fit", evidence: "no shipped product" });
    expect(state.stage).toBe("execution_mode");
  });

  it("keeps approval behind sourcing completion and a non-empty selection", () => {
    let state = createRecruitingWorkflow("role-1", ["a", "b", "c"]);
    state = { ...state, stage: "execution_mode" };
    state = chooseExecutionMode(state, "manual");
    state = startSourcing(state, { screen: 100, match: 25, candidateIds: ["x", "y"] });
    expect(() => approveCandidates(state, [])).toThrow("请至少选择一位候选人");
    expect(approveCandidates(state, ["x"]).stage).toBe("simulated_outreach");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the workflow module does not exist**

Run: `npm.cmd test -- tests/recruiting-workflow/workflow.test.ts`

Expected: FAIL with a module-resolution error for `recruiting-workflow/domain/workflow`.

- [ ] **Step 3: Add the exact domain types**

```ts
export type RecruitingStage =
  | "calibration_samples"
  | "execution_mode"
  | "sourcing_run"
  | "candidate_approval"
  | "simulated_outreach"
  | "simulated_interview"
  | "completed";

export type CalibrationVerdict = "good_fit" | "maybe" | "not_a_fit";
export type ExecutionMode = "manual" | "automatic";
export type SourcingStatus = "idle" | "queued" | "searching" | "scoring" | "awaiting_review" | "completed" | "failed";
export type OutreachStatus = "waiting_contact" | "simulated_sent" | "simulated_unread" | "simulated_opened" | "failed" | "simulated_interested";

export interface CalibrationFeedback {
  candidateId: string;
  verdict: CalibrationVerdict;
  evidence: string;
  createdAt: string;
}

export interface RecruitingWorkflowState {
  roleId: string;
  stage: RecruitingStage;
  criteriaVersion: number;
  calibration: { sampleIds: string[]; activeIndex: number; feedback: CalibrationFeedback[] };
  executionMode: ExecutionMode | null;
  sourcing: { status: SourcingStatus; screen: number; match: number; candidateIds: string[]; error: string | null };
  selection: { selectedIds: string[]; approvedIds: string[] };
  outreach: Record<string, OutreachStatus>;
  interview: { candidateId: string; startsAt: string } | null;
  updatedAt: string;
}
```

- [ ] **Step 4: Implement pure transitions with explicit guards**

```ts
import type { CalibrationFeedback, ExecutionMode, RecruitingWorkflowState } from "./types";

const timestamp = () => new Date().toISOString();

export function createRecruitingWorkflow(roleId: string, sampleIds: string[]): RecruitingWorkflowState {
  if (sampleIds.length !== 3) throw new Error("样本校准必须包含三位候选人。");
  return {
    roleId,
    stage: "calibration_samples",
    criteriaVersion: 1,
    calibration: { sampleIds, activeIndex: 0, feedback: [] },
    executionMode: null,
    sourcing: { status: "idle", screen: 0, match: 0, candidateIds: [], error: null },
    selection: { selectedIds: [], approvedIds: [] },
    outreach: {},
    interview: null,
    updatedAt: timestamp(),
  };
}

export function recordCalibrationVerdict(state: RecruitingWorkflowState, input: Omit<CalibrationFeedback, "createdAt">): RecruitingWorkflowState {
  if (state.stage !== "calibration_samples") throw new Error("当前不在样本校准阶段。");
  const expectedId = state.calibration.sampleIds[state.calibration.activeIndex];
  if (input.candidateId !== expectedId) throw new Error("只能评价当前样本。");
  const feedback = [...state.calibration.feedback, { ...input, createdAt: timestamp() }];
  const complete = feedback.length === state.calibration.sampleIds.length;
  return {
    ...state,
    stage: complete ? "execution_mode" : state.stage,
    criteriaVersion: state.criteriaVersion + 1,
    calibration: { ...state.calibration, activeIndex: Math.min(feedback.length, 2), feedback },
    updatedAt: timestamp(),
  };
}

export function chooseExecutionMode(state: RecruitingWorkflowState, mode: ExecutionMode): RecruitingWorkflowState {
  if (state.stage !== "execution_mode") throw new Error("请先完成三位样本校准。");
  return { ...state, stage: "sourcing_run", executionMode: mode, updatedAt: timestamp() };
}

export function startSourcing(state: RecruitingWorkflowState, result: { screen: number; match: number; candidateIds: string[] }): RecruitingWorkflowState {
  if (state.stage !== "sourcing_run") throw new Error("当前无法启动完整搜索。");
  return { ...state, stage: "candidate_approval", sourcing: { status: "awaiting_review", ...result, error: null }, updatedAt: timestamp() };
}

export function approveCandidates(state: RecruitingWorkflowState, selectedIds: string[]): RecruitingWorkflowState {
  if (state.stage !== "candidate_approval") throw new Error("当前没有待审批候选人。");
  if (selectedIds.length === 0) throw new Error("请至少选择一位候选人。");
  const allowed = new Set(state.sourcing.candidateIds);
  if (selectedIds.some((id) => !allowed.has(id))) throw new Error("选择中包含不在审批队列的候选人。");
  return {
    ...state,
    stage: "simulated_outreach",
    selection: { selectedIds, approvedIds: selectedIds },
    outreach: Object.fromEntries(selectedIds.map((id) => [id, "waiting_contact" as const])),
    updatedAt: timestamp(),
  };
}
```

- [ ] **Step 5: Run the focused test and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/workflow.test.ts`

Expected: PASS, 3 tests.

Commit:

```bash
git add src/features/recruiting-workflow/domain tests/recruiting-workflow/workflow.test.ts
git commit -m "feat: define recruiting workflow state"
```

### Task 2: Add replaceable provider contracts and virtual implementations

**Files:**
- Create: `src/features/recruiting-workflow/providers/contracts.ts`
- Create: `src/features/recruiting-workflow/providers/mock-candidate-data-source.ts`
- Create: `src/features/recruiting-workflow/providers/simulated-outreach-provider.ts`
- Create: `src/features/recruiting-workflow/providers/simulated-calendar-provider.ts`
- Test: `tests/recruiting-workflow/providers.test.ts`

- [ ] **Step 1: Write provider contract tests**

```ts
import { describe, expect, it } from "vitest";
import { createRoleDraft } from "@/features/role-brief/domain/workflow";
import { MockCandidateDataSource } from "@/features/recruiting-workflow/providers/mock-candidate-data-source";
import { SimulatedOutreachProvider } from "@/features/recruiting-workflow/providers/simulated-outreach-provider";
import { SimulatedCalendarProvider } from "@/features/recruiting-workflow/providers/simulated-calendar-provider";

describe("virtual recruiting providers", () => {
  it("returns exactly three deterministic calibration samples", async () => {
    const role = { ...createRoleDraft("招聘一位 AI 产品经理"), mustHaves: ["AI 产品设计"] };
    const samples = await new MockCandidateDataSource().getCalibrationSamples(role, 3);
    expect(samples).toHaveLength(3);
    expect(new Set(samples.map((item) => item.candidate.id)).size).toBe(3);
  });

  it("never performs external outreach", async () => {
    const result = await new SimulatedOutreachProvider().execute({ roleId: "r", candidateIds: ["c"] });
    expect(result.externalSideEffect).toBe(false);
    expect(result.statuses.c).toBe("simulated_sent");
  });

  it("creates a deterministic local interview slot", async () => {
    const result = await new SimulatedCalendarProvider().schedule({ roleId: "r", candidateId: "c", startsAt: "2026-08-05T02:00:00.000Z" });
    expect(result.externalSideEffect).toBe(false);
    expect(result.schedule.candidateId).toBe("c");
  });
});
```

- [ ] **Step 2: Run the test and verify missing provider modules**

Run: `npm.cmd test -- tests/recruiting-workflow/providers.test.ts`

Expected: FAIL with module-resolution errors.

- [ ] **Step 3: Define stable provider interfaces**

```ts
import type { CandidateMatch, CandidateProfile } from "@/features/candidates/domain/types";
import type { RoleBrief } from "@/features/role-brief/domain/types";
import type { OutreachStatus } from "../domain/types";

export interface CandidatePage { items: CandidateMatch[]; nextCursor: string | null; total: number; source: "synthetic" | "real"; }
export interface CandidateDataSource {
  search(role: RoleBrief, cursor?: string, pageSize?: number): Promise<CandidatePage>;
  getById(candidateId: string): Promise<CandidateProfile | null>;
  getCalibrationSamples(role: RoleBrief, count: number): Promise<CandidateMatch[]>;
}
export interface OutreachProvider {
  execute(input: { roleId: string; candidateIds: string[] }): Promise<{ statuses: Record<string, OutreachStatus>; externalSideEffect: boolean }>;
}
export interface CalendarProvider {
  schedule(input: { roleId: string; candidateId: string; startsAt: string }): Promise<{ schedule: { candidateId: string; startsAt: string }; externalSideEffect: boolean }>;
}
```

- [ ] **Step 4: Implement deterministic virtual providers**

```ts
export class MockCandidateDataSource implements CandidateDataSource {
  async search(role: RoleBrief, cursor = "0", pageSize = 8): Promise<CandidatePage> {
    const matches = searchCandidates(role);
    const offset = Number.parseInt(cursor, 10) || 0;
    const items = matches.slice(offset, offset + pageSize);
    const nextOffset = offset + items.length;
    return { items, nextCursor: nextOffset < matches.length ? String(nextOffset) : null, total: matches.length, source: "synthetic" };
  }
  async getById(candidateId: string) { return seedCandidates.find((item) => item.id === candidateId) ?? null; }
  async getCalibrationSamples(role: RoleBrief, count: number) { return searchCandidates(role).slice(0, count); }
}

export class SimulatedOutreachProvider implements OutreachProvider {
  async execute(input: { roleId: string; candidateIds: string[] }) {
    return { statuses: Object.fromEntries(input.candidateIds.map((id) => [id, "simulated_sent" as const])), externalSideEffect: false };
  }
}

export class SimulatedCalendarProvider implements CalendarProvider {
  async schedule(input: { roleId: string; candidateId: string; startsAt: string }) {
    return { schedule: { candidateId: input.candidateId, startsAt: input.startsAt }, externalSideEffect: false };
  }
}
```

- [ ] **Step 5: Run provider tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/providers.test.ts`

Expected: PASS, 3 tests.

Commit:

```bash
git add src/features/recruiting-workflow/providers tests/recruiting-workflow/providers.test.ts
git commit -m "feat: add virtual recruiting providers"
```

### Task 3: Persist workflow state with optimistic versioning

**Files:**
- Modify: `src/server/db/migrate.ts`
- Create: `src/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository.ts`
- Test: `tests/recruiting-workflow/repository.test.ts`

- [ ] **Step 1: Write the in-memory SQLite repository test**

```ts
import Database from "better-sqlite3";
import { expect, it } from "vitest";
import { createRecruitingWorkflow } from "@/features/recruiting-workflow/domain/workflow";
import { SqliteRecruitingWorkflowRepository, WorkflowVersionConflictError } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";

it("persists workflow state and rejects stale versions", () => {
  const db = new Database(":memory:");
  const repository = new SqliteRecruitingWorkflowRepository(db);
  db.prepare(`INSERT INTO roles (id, payload_json, version, agent_summary, active_question_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run("role-1", "{}", 1, null, null, "2026-08-01T00:00:00.000Z", "2026-08-01T00:00:00.000Z");
  repository.create(createRecruitingWorkflow("role-1", ["a", "b", "c"]));
  const stored = repository.get("role-1");
  expect(stored?.version).toBe(1);
  repository.update({ ...stored!, state: { ...stored!.state, criteriaVersion: 2 } }, 1, "criteria_updated");
  expect(() => repository.update(stored!, 1, "stale_write")).toThrow(WorkflowVersionConflictError);
});
```

- [ ] **Step 2: Run the repository test and verify it fails**

Run: `npm.cmd test -- tests/recruiting-workflow/repository.test.ts`

Expected: FAIL because the repository module does not exist.

- [ ] **Step 3: Add workflow tables to the idempotent migration**

```sql
CREATE TABLE IF NOT EXISTS recruiting_workflows (
  role_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS workflow_events (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

- [ ] **Step 4: Implement create, get, and compare-and-swap update**

```ts
import type Database from "better-sqlite3";
import { getDatabase } from "@/server/db/connection";
import { migrateDatabase } from "@/server/db/migrate";
import type { RecruitingWorkflowState } from "../domain/types";

export interface StoredRecruitingWorkflow { state: RecruitingWorkflowState; version: number; }

export class WorkflowVersionConflictError extends Error {
  constructor() { super("招聘流程已在其他操作中更新，请刷新后重试。"); }
}

export class SqliteRecruitingWorkflowRepository {
  constructor(private readonly db: Database.Database = getDatabase()) {
    migrateDatabase(this.db);
  }

  create(state: RecruitingWorkflowState): StoredRecruitingWorkflow {
    const createdAt = new Date().toISOString();
    const insert = this.db.prepare(`INSERT INTO recruiting_workflows (role_id, payload_json, version, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?)`);
    const event = this.db.prepare(`INSERT INTO workflow_events (id, role_id, action, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)`);
    this.db.transaction(() => {
      insert.run(state.roleId, JSON.stringify(state), createdAt, createdAt);
      event.run(`workflow-event-${crypto.randomUUID()}`, state.roleId, "workflow_created", JSON.stringify({ version: 1 }), createdAt);
    })();
    return { state, version: 1 };
  }

  get(roleId: string): StoredRecruitingWorkflow | null {
    const row = this.db.prepare("SELECT payload_json, version FROM recruiting_workflows WHERE role_id = ?").get(roleId) as { payload_json: string; version: number } | undefined;
    return row ? { state: JSON.parse(row.payload_json) as RecruitingWorkflowState, version: row.version } : null;
  }

  update(workflow: StoredRecruitingWorkflow, expectedVersion: number, action: string): StoredRecruitingWorkflow {
    const updatedAt = new Date().toISOString();
    const nextVersion = expectedVersion + 1;
    const update = this.db.prepare(`UPDATE recruiting_workflows SET payload_json = ?, version = ?, updated_at = ?
      WHERE role_id = ? AND version = ?`);
    const event = this.db.prepare(`INSERT INTO workflow_events (id, role_id, action, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?)`);
    this.db.transaction(() => {
      const result = update.run(JSON.stringify(workflow.state), nextVersion, updatedAt, workflow.state.roleId, expectedVersion);
      if (result.changes !== 1) throw new WorkflowVersionConflictError();
      event.run(`workflow-event-${crypto.randomUUID()}`, workflow.state.roleId, action, JSON.stringify({ version: nextVersion }), updatedAt);
    })();
    return { state: workflow.state, version: nextVersion };
  }
}
```

- [ ] **Step 5: Run repository tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/repository.test.ts`

Expected: PASS, 1 test.

Commit:

```bash
git add src/server/db/migrate.ts src/features/recruiting-workflow/data tests/recruiting-workflow/repository.test.ts
git commit -m "feat: persist recruiting workflow state"
```

### Task 4: Add application orchestration and the workflow API

**Files:**
- Create: `src/features/recruiting-workflow/application/recruiting-workflow-service.ts`
- Create: `src/app/api/roles/[roleId]/workflow/route.ts`
- Test: `tests/recruiting-workflow/api.test.ts`

- [ ] **Step 1: Write API tests for GET and guarded POST actions**

```ts
import { expect, it, vi } from "vitest";

it("rejects a calibration verdict without an expected version", async () => {
  const request = new Request("http://localhost/api/roles/r/workflow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "calibrate" }) });
  const { POST } = await import("@/app/api/roles/[roleId]/workflow/route");
  const response = await POST(request, { params: Promise.resolve({ roleId: "r" }) });
  expect(response.status).toBe(400);
});
```

- [ ] **Step 2: Run the API test and verify the route is missing**

Run: `npm.cmd test -- tests/recruiting-workflow/api.test.ts`

Expected: FAIL with module-resolution error.

- [ ] **Step 3: Implement the application service actions**

```ts
import type { RoleBrief } from "@/features/role-brief/domain/types";
import { approveCandidates, chooseExecutionMode, createRecruitingWorkflow, recordCalibrationVerdict, startSourcing } from "../domain/workflow";
import type { CalibrationFeedback, ExecutionMode } from "../domain/types";
import { SqliteRecruitingWorkflowRepository } from "../data/sqlite-recruiting-workflow-repository";
import type { CalendarProvider, CandidateDataSource, OutreachProvider } from "../providers/contracts";
import { MockCandidateDataSource } from "../providers/mock-candidate-data-source";
import { SimulatedCalendarProvider } from "../providers/simulated-calendar-provider";
import { SimulatedOutreachProvider } from "../providers/simulated-outreach-provider";

export class RecruitingWorkflowService {
  constructor(
    private readonly repository = new SqliteRecruitingWorkflowRepository(),
    private readonly candidates: CandidateDataSource = new MockCandidateDataSource(),
    private readonly outreach: OutreachProvider = new SimulatedOutreachProvider(),
    private readonly calendar: CalendarProvider = new SimulatedCalendarProvider(),
  ) {}

  get(roleId: string) {
    return this.repository.get(roleId);
  }

  async initialize(role: RoleBrief) {
    const existing = this.repository.get(role.id);
    if (existing) return existing;
    const samples = await this.candidates.getCalibrationSamples(role, 3);
    return this.repository.create(createRecruitingWorkflow(role.id, samples.map((item) => item.candidate.id)));
  }

  calibrate(roleId: string, expectedVersion: number, input: Omit<CalibrationFeedback, "createdAt">) {
    const stored = this.require(roleId);
    const state = recordCalibrationVerdict(stored.state, input);
    return this.repository.update({ state, version: stored.version }, expectedVersion, "calibration_feedback");
  }

  chooseMode(roleId: string, expectedVersion: number, mode: ExecutionMode) {
    const stored = this.require(roleId);
    const state = chooseExecutionMode(stored.state, mode);
    return this.repository.update({ state, version: stored.version }, expectedVersion, "execution_mode_selected");
  }

  async runSearch(role: RoleBrief, expectedVersion: number) {
    const stored = this.require(role.id);
    const page = await this.candidates.search(role, "0", 100);
    const state = startSourcing(stored.state, { screen: page.total, match: page.items.length, candidateIds: page.items.map((item) => item.candidate.id) });
    return this.repository.update({ state, version: stored.version }, expectedVersion, "sourcing_completed");
  }

  approve(roleId: string, expectedVersion: number, ids: string[]) {
    const stored = this.require(roleId);
    const state = approveCandidates(stored.state, ids);
    return this.repository.update({ state, version: stored.version }, expectedVersion, "candidates_approved");
  }

  async simulateOutreach(roleId: string, expectedVersion: number) {
    const stored = this.require(roleId);
    if (stored.state.stage !== "simulated_outreach") throw new Error("当前无法执行模拟联系。");
    const result = await this.outreach.execute({ roleId, candidateIds: stored.state.selection.approvedIds });
    const state = { ...stored.state, stage: "simulated_interview" as const, outreach: result.statuses, updatedAt: new Date().toISOString() };
    return this.repository.update({ state, version: stored.version }, expectedVersion, "outreach_simulated");
  }

  async scheduleInterview(roleId: string, expectedVersion: number, candidateId: string, startsAt: string) {
    const stored = this.require(roleId);
    if (stored.state.stage !== "simulated_interview") throw new Error("当前无法安排模拟面试。");
    const result = await this.calendar.schedule({ roleId, candidateId, startsAt });
    const state = { ...stored.state, stage: "completed" as const, interview: result.schedule, updatedAt: new Date().toISOString() };
    return this.repository.update({ state, version: stored.version }, expectedVersion, "interview_simulated");
  }

  private require(roleId: string) {
    const stored = this.repository.get(roleId);
    if (!stored) throw new Error("未找到招聘流程。");
    return stored;
  }
}
```

- [ ] **Step 4: Implement one Zod-discriminated Route Handler**

```ts
import { z } from "zod";
import { RoleWorkspaceService } from "@/features/recruiting-agent/application/role-workspace-service";
import { RecruitingWorkflowService } from "@/features/recruiting-workflow/application/recruiting-workflow-service";
import { WorkflowVersionConflictError } from "@/features/recruiting-workflow/data/sqlite-recruiting-workflow-repository";

export const runtime = "nodejs";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("calibrate"), expectedVersion: z.number().int().positive(), candidateId: z.string().min(1), verdict: z.enum(["good_fit", "maybe", "not_a_fit"]), evidence: z.string().min(1).max(500) }),
  z.object({ action: z.literal("choose_mode"), expectedVersion: z.number().int().positive(), mode: z.enum(["manual", "automatic"]) }),
  z.object({ action: z.literal("run_search"), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("approve"), expectedVersion: z.number().int().positive(), candidateIds: z.array(z.string().min(1)).min(1) }),
  z.object({ action: z.literal("simulate_outreach"), expectedVersion: z.number().int().positive() }),
  z.object({ action: z.literal("schedule_interview"), expectedVersion: z.number().int().positive(), candidateId: z.string().min(1), startsAt: z.string().datetime() }),
]);

export async function GET(_request: Request, context: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await context.params;
  const workflow = new RecruitingWorkflowService().get(roleId);
  return workflow
    ? Response.json(workflow)
    : Response.json({ code: "WORKFLOW_NOT_FOUND", message: "未找到招聘流程。" }, { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ roleId: string }> }) {
  try {
    const { roleId } = await context.params;
    const action = actionSchema.parse(await request.json());
    const service = new RecruitingWorkflowService();
    const result = action.action === "calibrate"
      ? service.calibrate(roleId, action.expectedVersion, { candidateId: action.candidateId, verdict: action.verdict, evidence: action.evidence })
      : action.action === "choose_mode"
        ? service.chooseMode(roleId, action.expectedVersion, action.mode)
        : action.action === "run_search"
          ? await service.runSearch(new RoleWorkspaceService().get(roleId).role, action.expectedVersion)
          : action.action === "approve"
            ? service.approve(roleId, action.expectedVersion, action.candidateIds)
            : action.action === "simulate_outreach"
              ? await service.simulateOutreach(roleId, action.expectedVersion)
              : await service.scheduleInterview(roleId, action.expectedVersion, action.candidateId, action.startsAt);
    return Response.json(result);
  } catch (error) {
    const status = error instanceof WorkflowVersionConflictError ? 409 : error instanceof z.ZodError ? 400 : 422;
    return Response.json({ code: status === 409 ? "WORKFLOW_VERSION_CONFLICT" : "WORKFLOW_ACTION_FAILED", message: error instanceof Error ? error.message : "招聘流程操作失败。" }, { status });
  }
}
```

- [ ] **Step 5: Run API tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/api.test.ts`

Expected: PASS.

Commit:

```bash
git add src/features/recruiting-workflow/application src/app/api/roles/[roleId]/workflow tests/recruiting-workflow/api.test.ts
git commit -m "feat: expose recruiting workflow API"
```

### Task 5: Build the Feishu-aligned fixed desktop shell

**Files:**
- Create: `src/features/recruiting-workflow/components/RecruitingAppShell.tsx`
- Create: `src/features/recruiting-workflow/components/RecruitingStageStepper.tsx`
- Create: `src/features/recruiting-workflow/components/RecruitingContextRail.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/recruiting-workflow/presentation.test.tsx`

- [ ] **Step 1: Write shell presentation tests**

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { RecruitingAppShell } from "@/features/recruiting-workflow/components/RecruitingAppShell";

it("renders the fixed navigation, task stage, and narrow status rail", () => {
  render(<RecruitingAppShell roleTitle="AI 产品经理" stage="calibration_samples" criteriaVersion={4}><div>当前任务</div></RecruitingAppShell>);
  expect(screen.getByLabelText("招聘工作区导航")).toBeInTheDocument();
  expect(screen.getByText("当前任务")).toBeInTheDocument();
  expect(screen.getByLabelText("招聘流程状态")).toHaveClass("nw-context-rail");
});
```

- [ ] **Step 2: Run the test and verify missing components**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: FAIL with module-resolution error.

- [ ] **Step 3: Implement semantic shell components**

```tsx
export function RecruitingAppShell({ roleTitle, stage, criteriaVersion, children }: Props) {
  return <main className="nw-shell">
    <RoleSidebar />
    <section className="nw-main">
      <header className="nw-role-header"><h1>{roleTitle}</h1><span>条件版本 v{criteriaVersion} · 已保存</span></header>
      <RecruitingStageStepper stage={stage} />
      <div className="nw-stage">{children}</div>
    </section>
    <RecruitingContextRail stage={stage} criteriaVersion={criteriaVersion} />
  </main>;
}
```

- [ ] **Step 4: Add the exact approved layout CSS**

```css
.nw-shell { min-width: 1180px; min-height: 100vh; display: grid; grid-template-columns: 208px minmax(0, 1fr) 176px; background: #fff; color: #292622; }
.nw-main { min-width: 0; }
.nw-role-header { height: 72px; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e3dfd8; }
.nw-role-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.025em; }
.nw-role-header span { color: #8b847a; font-size: 12px; }
.nw-stage { width: min(100%, 1056px); margin: 0 auto; padding: 32px 40px 48px; }
.nw-context-rail { width: 176px; padding: 24px 12px; background: #f8f6f2; border-left: 1px solid #dfdbd3; }
```

- [ ] **Step 5: Run presentation tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: PASS.

Commit:

```bash
git add src/features/recruiting-workflow/components src/features/role-brief/components/RoleBriefWorkspace.tsx src/app/globals.css tests/recruiting-workflow/presentation.test.tsx
git commit -m "feat: add Feishu-aligned recruiting shell"
```

### Task 6: Implement calibration, preference learning, and mode selection UI

**Files:**
- Create: `src/features/recruiting-workflow/hooks/useRecruitingWorkflow.ts`
- Create: `src/features/recruiting-workflow/components/CalibrationStage.tsx`
- Create: `src/features/recruiting-workflow/components/ExecutionModeStage.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Test: `tests/recruiting-workflow/presentation.test.tsx`

- [ ] **Step 1: Add failing interaction tests**

```tsx
it("requires evidence after selecting a calibration verdict", async () => {
  const user = userEvent.setup();
  render(<CalibrationStage candidate={candidate} index={0} total={3} onSubmit={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: "Maybe" }));
  expect(screen.getByLabelText("判断依据")).toBeRequired();
  expect(screen.getByRole("button", { name: "提交判断" })).toBeDisabled();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: FAIL because `CalibrationStage` is missing.

- [ ] **Step 3: Implement the workflow hook**

```ts
export function useRecruitingWorkflow(roleId: string, initial: StoredRecruitingWorkflow | null) {
  const [workflow, setWorkflow] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const mutate = useCallback(async (action: Record<string, unknown>) => {
    if (!workflow) return;
    const response = await fetch(`/api/roles/${roleId}/workflow`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...action, expectedVersion: workflow.version }) });
    const body = await response.json();
    if (!response.ok) { setError(body.message || "操作失败，请重试。"); return; }
    setWorkflow(body); setError(null);
  }, [roleId, workflow]);
  return { workflow, error, mutate };
}
```

- [ ] **Step 4: Implement calibration and mode components using Feishu card spacing**

```tsx
export function CalibrationStage({ candidate, index, total, onSubmit }: Props) {
  const [verdict, setVerdict] = useState<CalibrationVerdict | null>(null);
  const [evidence, setEvidence] = useState("");
  return <section className="nw-task-card">
    <header><span>候选人样本 {index + 1} / {total}</span><b>{candidate.score} 分</b></header>
    <h2>{candidate.candidate.name} · {candidate.candidate.title}</h2>
    <CandidateEvidence match={candidate} />
    <div className="nw-verdict-list">{[["good_fit", "Good fit"], ["maybe", "Maybe"], ["not_a_fit", "Not a fit"]].map(([value, label]) => <button key={value} onClick={() => setVerdict(value as CalibrationVerdict)}>{label}</button>)}</div>
    <textarea required aria-label="判断依据" value={evidence} onChange={(event) => setEvidence(event.target.value)} />
    <button disabled={!verdict || !evidence.trim()} onClick={() => onSubmit({ candidateId: candidate.candidate.id, verdict: verdict!, evidence: evidence.trim() })}>提交判断</button>
  </section>;
}
```

- [ ] **Step 5: Run interaction tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: PASS.

Commit:

```bash
git add src/features/recruiting-workflow/hooks src/features/recruiting-workflow/components/CalibrationStage.tsx src/features/recruiting-workflow/components/ExecutionModeStage.tsx src/features/role-brief/components/RoleBriefWorkspace.tsx tests/recruiting-workflow/presentation.test.tsx
git commit -m "feat: add candidate calibration flow"
```

### Task 7: Implement complete search and the real-time funnel

**Files:**
- Create: `src/features/recruiting-workflow/components/SourcingRunStage.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/recruiting-workflow/presentation.test.tsx`

- [ ] **Step 1: Add the failing funnel test**

```tsx
it("renders non-overlapping funnel counts", () => {
  render(<SourcingRunStage sourcing={{ status: "awaiting_review", screen: 100, match: 25, candidateIds: ["a", "b"], error: null }} onRun={vi.fn()} />);
  expect(screen.getByText("100", { selector: "strong" })).toBeInTheDocument();
  expect(screen.getByText("25", { selector: "strong" })).toBeInTheDocument();
  expect(screen.getByText("等待人工审批")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: FAIL because `SourcingRunStage` is missing.

- [ ] **Step 3: Implement the sourcing stage**

```tsx
export function SourcingRunStage({ sourcing, onRun }: Props) {
  return <section className="nw-sourcing-stage">
    <p className="nw-eyebrow">完整搜索</p><h2>从校准偏好生成候选人队列</h2>
    <div className="nw-funnel">
      <div><strong>{sourcing.screen}</strong><span>Screen</span></div>
      <div><strong>{sourcing.match}</strong><span>Match</span></div>
      <div><strong>0</strong><span>Contact</span></div>
      <div><strong>0</strong><span>Interested</span></div>
      <div><strong>0</strong><span>Interview</span></div>
    </div>
    {sourcing.status === "idle" ? <button onClick={onRun}>开始完整搜索</button> : <p role="status">{sourcing.status === "awaiting_review" ? "等待人工审批" : "正在生成候选人队列"}</p>}
  </section>;
}
```

- [ ] **Step 4: Add Feishu-aligned dense funnel CSS and run tests**

```css
.nw-funnel { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin: 24px 0; border: 1px solid #dfdbd3; border-radius: 10px; overflow: hidden; }
.nw-funnel > div { min-height: 74px; padding: 14px; border-right: 1px solid #dfdbd3; background: #fff; }
.nw-funnel > div:last-child { border-right: 0; }
.nw-funnel strong, .nw-funnel span { display: block; }
.nw-funnel strong { font-size: 22px; }
.nw-funnel span { margin-top: 5px; color: #857e74; font-size: 11px; }
```

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/recruiting-workflow/components/SourcingRunStage.tsx src/features/role-brief/components/RoleBriefWorkspace.tsx src/app/globals.css tests/recruiting-workflow/presentation.test.tsx
git commit -m "feat: add sourcing run funnel"
```

### Task 8: Implement paged candidate approval with persistent selection

**Files:**
- Create: `src/features/recruiting-workflow/components/CandidateApprovalStage.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Test: `tests/recruiting-workflow/presentation.test.tsx`

- [ ] **Step 1: Write selection behavior tests**

```tsx
it("keeps selection across pages and disables approval for zero candidates", async () => {
  const user = userEvent.setup();
  const onApprove = vi.fn();
  render(<CandidateApprovalStage candidates={candidates} pageSize={2} onApprove={onApprove} />);
  expect(screen.getByRole("button", { name: "批准并模拟联系" })).toBeDisabled();
  await user.click(screen.getByRole("checkbox", { name: "选择候选人 林舟" }));
  await user.click(screen.getByRole("button", { name: "下一页" }));
  expect(screen.getByText("已选择 1 位候选人")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: FAIL because the approval component is missing.

- [ ] **Step 3: Implement role-level selection independent of pagination**

```tsx
export function CandidateApprovalStage({ candidates, pageSize, onApprove }: Props) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const visible = candidates.slice(page * pageSize, page * pageSize + pageSize);
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  return <section>
    <header className="nw-approval-toolbar"><span>已选择 {selected.size} 位候选人</span><button onClick={() => setSelected(new Set(candidates.map((item) => item.candidate.id)))}>全选</button><button onClick={() => setSelected(new Set())}>清空</button><button disabled={selected.size === 0} onClick={() => onApprove([...selected])}>批准并模拟联系</button></header>
    <div className="nw-approval-list">{visible.map((match) => <article key={match.candidate.id}><input aria-label={`选择候选人 ${match.candidate.name}`} checked={selected.has(match.candidate.id)} onChange={() => toggle(match.candidate.id)} type="checkbox" /><CandidateSummary match={match} /></article>)}</div>
    <footer><button disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</button><button disabled={(page + 1) * pageSize >= candidates.length} onClick={() => setPage(page + 1)}>下一页</button></footer>
  </section>;
}
```

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: PASS.

Commit:

```bash
git add src/features/recruiting-workflow/components/CandidateApprovalStage.tsx src/features/role-brief/components/RoleBriefWorkspace.tsx tests/recruiting-workflow/presentation.test.tsx
git commit -m "feat: add candidate approval queue"
```

### Task 9: Implement simulated outreach and interview scheduling

**Files:**
- Create: `src/features/recruiting-workflow/components/OutreachStage.tsx`
- Create: `src/features/recruiting-workflow/components/InterviewStage.tsx`
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Test: `tests/recruiting-workflow/presentation.test.tsx`

- [ ] **Step 1: Write simulation boundary tests**

```tsx
it("labels all outreach and scheduling actions as simulations", () => {
  render(<OutreachStage statuses={{ a: "simulated_sent" }} onAdvance={vi.fn()} />);
  expect(screen.getByText("模拟已发送")).toBeInTheDocument();
  expect(screen.getByText(/不会发送真实消息/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify missing components**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement explicit simulated states**

```tsx
const outreachLabels: Record<OutreachStatus, string> = {
  waiting_contact: "待模拟联系",
  simulated_sent: "模拟已发送",
  simulated_unread: "模拟未读",
  simulated_opened: "模拟已打开",
  failed: "模拟失败",
  simulated_interested: "模拟感兴趣",
};

export function OutreachStage({ statuses, onAdvance }: Props) {
  return <section className="nw-task-card"><h2>候选人联系进度</h2><p className="nw-safety-note">虚拟数据模式：不会发送真实消息。</p>{Object.entries(statuses).map(([id, status]) => <div key={id}>{id}<strong>{outreachLabels[status]}</strong></div>)}<button onClick={onAdvance}>模拟候选人感兴趣</button></section>;
}

export function InterviewStage({ candidateId, onSchedule }: Props) {
  const [startsAt, setStartsAt] = useState("2026-08-05T10:00");
  return <section className="nw-task-card"><h2>模拟面试排期</h2><p className="nw-safety-note">不会创建真实日历事件。</p><input aria-label="面试时间" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /><button onClick={() => onSchedule(candidateId, new Date(startsAt).toISOString())}>确认模拟排期</button></section>;
}
```

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/presentation.test.tsx`

Expected: PASS.

Commit:

```bash
git add src/features/recruiting-workflow/components/OutreachStage.tsx src/features/recruiting-workflow/components/InterviewStage.tsx src/features/role-brief/components/RoleBriefWorkspace.tsx tests/recruiting-workflow/presentation.test.tsx
git commit -m "feat: add simulated outreach and interviews"
```

### Task 10: Integrate server-rendered recovery and current candidate API

**Files:**
- Modify: `src/app/hire/role/[roleId]/page.tsx`
- Modify: `src/features/recruiting-agent/application/role-workspace-service.ts`
- Modify: `src/app/api/roles/[roleId]/candidates/route.ts`
- Test: `tests/recruiting-workflow/api.test.ts`

- [ ] **Step 1: Add recovery tests**

```ts
it("returns the stored workflow on refresh instead of restarting calibration", async () => {
  const first = service.get("role-1");
  const second = service.get("role-1");
  expect(second).toEqual(first);
});
```

- [ ] **Step 2: Run the test and verify failure against the old snapshot shape**

Run: `npm.cmd test -- tests/recruiting-workflow/api.test.ts`

Expected: FAIL because `WorkspaceSnapshot` has no workflow field.

- [ ] **Step 3: Extend the server snapshot and page props**

```ts
export interface WorkspaceSnapshot {
  role: RoleBrief;
  version: number;
  agentSummary: string | null;
  activeQuestion: ClarificationQuestion | null;
  recruitingWorkflow: StoredRecruitingWorkflow | null;
}
```

When confirming a Brief, call `RecruitingWorkflowService.initialize(role)` once if no workflow exists. On page load, fetch the stored workflow and pass it to `RoleBriefWorkspace` as part of `initialWorkspace`.

- [ ] **Step 4: Delegate candidate paging through the provider**

```ts
const url = new URL(request.url);
const cursor = url.searchParams.get("cursor") ?? undefined;
const page = await new MockCandidateDataSource().search(workspace.role, cursor, 8);
return Response.json(page);
```

- [ ] **Step 5: Run API tests and commit**

Run: `npm.cmd test -- tests/recruiting-workflow/api.test.ts`

Expected: PASS.

Commit:

```bash
git add src/app/hire/role/[roleId]/page.tsx src/features/recruiting-agent/application/role-workspace-service.ts src/app/api/roles/[roleId]/candidates/route.ts tests/recruiting-workflow/api.test.ts
git commit -m "feat: restore recruiting workflow on refresh"
```

### Task 11: Full verification against the approved design

**Files:**
- Modify: `README.md`
- Modify: `STATUS.md`
- Create: `screenshots/feishu-aligned-1440.png`
- Create: `screenshots/feishu-aligned-1600.png`
- Create: `screenshots/feishu-aligned-1920.png`

- [ ] **Step 1: Run all automated quality gates**

Run:

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Start the application and verify the business API**

Run: `npm.cmd run dev`

Expected: Next.js reports a local URL and no startup errors.

Create a role through `/api/roles`, complete clarification using `/api/roles/[roleId]/answers`, then drive `/api/roles/[roleId]/workflow` through calibrate, choose_mode, run_search, approve, simulate_outreach, and schedule_interview. Expected: every response is 2xx, versions increase by one, and the final stage is `completed`.

- [ ] **Step 3: Verify browser behavior at three desktop widths**

For 1440px, 1600px, and 1920px:

1. Open `/hire` and a persisted `/hire/role/[roleId]`.
2. Confirm the body has meaningful content and no Next.js error overlay.
3. Confirm the left navigation computes to 208px and `.nw-context-rail` computes to 176px.
4. Confirm title, stepper, central task card, and status rail preserve their shared baselines.
5. Exercise one action per visible stage and verify the next state appears without a horizontal layout jump.
6. Save screenshots to the exact paths listed above.

- [ ] **Step 4: Update project documentation with the real verified state**

```md
## Complete local recruiting workflow

Nexus Hire now supports the Feishu-aligned 11-stage flow from role intake through simulated interview scheduling. Candidate, outreach, and calendar behavior run through replaceable provider contracts; the default providers use fictional local data and produce no external side effects.
```

- [ ] **Step 5: Run final diff and secret checks**

Run:

```bash
git diff --check
git status --short
git diff -- . ':!package-lock.json'
```

Expected: no whitespace errors, no `.env` file staged, and only planned source, tests, docs, and screenshots changed.

- [ ] **Step 6: Commit verified documentation and evidence**

```bash
git add README.md STATUS.md screenshots/feishu-aligned-1440.png screenshots/feishu-aligned-1600.png screenshots/feishu-aligned-1920.png
git commit -m "docs: record recruiting workflow verification"
```

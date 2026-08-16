# Candidate Review Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn each recommendation “查看简历” action into a three-sample candidate review workspace while preserving the global header and conversation history.

**Architecture:** Add a dedicated `mode=review` branch under the screening route. The shell receives a layout mode so review keeps the left history panel but hides the context rail; a new review stage owns candidate progression, Chinese verdict controls, and the resume detail pane.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Next navigation, Vitest, Testing Library, CSS.

---

### Task 1: Candidate match factory and resume detail

**Files:**
- Create: `src/features/candidates/data/candidate-match-factory.ts`
- Create: `src/features/recruiting-workflow/components/CandidateResumeDetail.tsx`

- [ ] Build deterministic `CandidateMatch` values from `seedCandidates`.
- [ ] Render candidate profile, tabs, work experience, contact details, recommendation reason, match score, and attachments.
- [ ] Use the selected candidate profile for visible identity fields and local fictional details for missing fields.

### Task 2: Chinese AI review interaction

**Files:**
- Create: `src/features/recruiting-workflow/components/CandidateReviewPanel.tsx`
- Test: `tests/recruiting-workflow/candidate-review-panel.test.tsx`

- [ ] Render Chinese progress, summary, question, verdict labels, and reason hints.
- [ ] Keep an optional Chinese note composer at the panel bottom.
- [ ] Advance immediately when “适合 / 待确认 / 不适合” is clicked.
- [ ] Verify all labels and callbacks with focused tests.

### Task 3: Review stage and candidate progression

**Files:**
- Create: `src/features/recruiting-workflow/components/CandidateReviewStage.tsx`
- Test: `tests/recruiting-workflow/candidate-review-stage.test.tsx`

- [ ] Resolve the current candidate from the URL.
- [ ] Render the AI panel and resume detail side by side.
- [ ] Save local verdict results and replace the candidate query parameter with the next sample.
- [ ] Show completion actions after the third candidate.

### Task 4: Route and shell integration

**Files:**
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `src/features/recruiting-workflow/components/RecruitingAppShell.tsx`
- Modify: `src/features/recruiting-workflow/components/CandidateRecommendationStage.tsx`
- Modify: `tests/recruiting-workflow/candidate-recommendation-stage.test.tsx`

- [ ] Route recommendation resume links to `view=screening&mode=review&candidate=...`.
- [ ] Render `CandidateReviewStage` for review mode and keep full screening for all mode.
- [ ] Preserve the header and conversation history in review mode while hiding the context rail and clarification composer.

### Task 5: Reference-matched styling and verification

**Files:**
- Modify: `src/app/globals.css`

- [ ] Add the two-column review layout, compact white panels, purple progress, dark primary action, tabs, score ring, and responsive stacking.
- [ ] Run focused tests, TypeScript checks, ESLint, and verify the live route.
- [ ] Do not create a Git commit unless explicitly requested.

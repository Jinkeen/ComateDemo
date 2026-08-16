# Metix-Style Clarification Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/hire` and `/hire/role/[roleId]` into the approved full-width, Metix-style local role-clarification workflow.

**Architecture:** Preserve the existing `RoleBrief` state machine and native GET command protocol. Replace only the layout and presentational components: a reusable full-height sidebar, a centered creation surface, a scrollable conversation timeline, a bottom-anchored question card, and a right-side derived criteria rail. The `SearchCriteriaPanel` remains a pure projection of `RoleBrief`, so answers have one source of truth.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, CSS, lucide-react, Vitest, Testing Library.

---

## File map

- Modify: `src/features/role-brief/components/NewRoleLanding.tsx` — full-screen centered creation surface.
- Modify: `src/features/role-brief/components/RoleSidebar.tsx` — shared 236px navigation and local-mode footer.
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx` — true full-width three-column composition.
- Modify: `src/features/role-brief/components/AgentConversation.tsx` — title, timeline and state-aware Agent transition.
- Modify: `src/features/role-brief/components/CurrentQuestionCard.tsx` — reference-style option rows and compact submit actions.
- Modify: `src/features/role-brief/components/SearchCriteriaPanel.tsx` — only confirmed criteria plus concise pending text.
- Modify: `src/app/globals.css` — replace the `rh-*` visual layer and remove conflicting legacy selectors from the active flow.
- Create: `tests/role-brief/landing.test.tsx` — verifies landing text input and safe, local-only cues.
- Modify: `tests/role-brief/agent-conversation.test.tsx` — verifies timeline answer and next-question contraction copy.
- Modify: `design-qa.md` — report the final comparison after browser verification.
- Modify: `STATUS.md` — record delivered layout state and validation.

### Task 1: Protect the current local workflow with presentation tests — completed

**Files:**
- Create: `tests/role-brief/landing.test.tsx`
- Modify: `tests/role-brief/agent-conversation.test.tsx`

- [ ] **Step 1: Write the landing-page assertion before changing presentation code**

```tsx
import { render, screen } from "@testing-library/react";
import { NewRoleLanding } from "@/features/role-brief/components/NewRoleLanding";

it("provides a local-only role description entry point", () => {
  render(<NewRoleLanding />);
  expect(screen.getByRole("heading", { name: "你好，准备开始招聘了吗？" })).toBeInTheDocument();
  expect(screen.getByLabelText("职位描述")).toHaveAttribute("name", "description");
  expect(screen.getByText("仅在本地模拟，不会发布职位或联系候选人")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the new test and confirm it fails against the previous landing copy**

Run: `npm.cmd run test -- tests/role-brief/landing.test.tsx`

Expected: FAIL because the new heading and local-only cue do not exist yet.

- [ ] **Step 3: Extend the conversation test for state-aware contraction copy**

```tsx
expect(screen.getByText("地点已确认为远程优先。接下来确认工作方式：")).toBeInTheDocument();
expect(screen.getByText("这个职位主要在哪个地区招聘？")).toBeInTheDocument();
expect(screen.getByText("远程优先")).toBeInTheDocument();
```

- [ ] **Step 4: Run the focused tests and confirm they fail only for missing new copy**

Run: `npm.cmd run test -- tests/role-brief/landing.test.tsx tests/role-brief/agent-conversation.test.tsx`

Expected: previous behavior tests stay green; assertions for redesigned copy fail.

### Task 2: Rebuild the full-screen creation surface — completed

**Files:**
- Modify: `src/features/role-brief/components/NewRoleLanding.tsx`
- Modify: `src/features/role-brief/components/RoleSidebar.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Make `RoleSidebar` accept an optional role**

```tsx
export function RoleSidebar({ role }: { role?: RoleBrief }) {
  // Render the All Roles section only when role is present.
}
```

This lets `/hire` and `/hire/role/[roleId]` share the same 236px navigation surface without inventing a placeholder role.

- [ ] **Step 2: Replace the landing JSX with a sidebar plus centered composer**

```tsx
<main className="rh-app-shell rh-landing">
  <RoleSidebar />
  <section className="rh-landing-main">
    <div className="rh-landing-hero">
      <div className="rh-agent-dot" aria-hidden="true" />
      <h1>你好，准备开始招聘了吗？</h1>
      <p>描述要招的人，Agent 会把招聘要求逐步收敛为可确认的岗位条件。</p>
      <form action="/hire/role/draft" method="get" className="rh-landing-composer">...</form>
    </div>
  </section>
</main>
```

The form keeps `description`, `required`, `minLength={16}`, and its existing GET action. Auxiliary buttons have `type="button"` and text saying they are local simulation placeholders.

- [ ] **Step 3: Implement the desktop and responsive layout tokens**

```css
.rh-app-shell { display: flex; min-height: 100dvh; width: 100%; }
.rh-sidebar { flex: 0 0 236px; min-height: 100dvh; }
.rh-landing-main { display: grid; flex: 1; min-width: 0; place-items: center; }
.rh-landing-hero { margin-top: 5vh; max-width: 900px; width: min(900px, calc(100% - 48px)); }
```

At `max-width: 760px`, hide the sidebar, make the composer width `calc(100% - 40px)`, and keep the primary submit target at least 44px high.

- [ ] **Step 4: Run focused tests**

Run: `npm.cmd run test -- tests/role-brief/landing.test.tsx`

Expected: PASS.

### Task 3: Make the role workspace consume the full browser width — completed

**Files:**
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the workspace shell class composition**

```tsx
<main className="rh-app-shell rh-workspace-shell">
  <RoleSidebar role={role} />
  <div className="rh-workspace-main">
    <header className="rh-workspace-header"><h1>{role.title}</h1></header>
    <div className="rh-workspace-grid">...</div>
  </div>
</main>
```

- [ ] **Step 2: Add the non-negotiable width rules**

```css
.rh-workspace-main { display: flex; flex: 1 1 auto; flex-direction: column; min-width: 0; }
.rh-workspace-grid { display: grid; flex: 1; grid-template-columns: minmax(0, 1fr) 320px; min-height: 0; }
.rh-right-rail { border-left: 1px solid var(--rh-line); min-width: 0; }
```

These rules directly fix the old defect where `.rh-main` sized itself to its contents and left a blank area to the right.

- [ ] **Step 3: Move the local safety copy into the right rail footer**

```tsx
<p className="rh-local-note">本地模拟：不会发布职位、搜索真实候选人、联系候选人或产生费用。</p>
```

- [ ] **Step 4: Run type checking**

Run: `npm.cmd run typecheck`

Expected: PASS.

### Task 4: Recompose the conversation as a timeline and bottom question card — completed

**Files:**
- Modify: `src/features/role-brief/components/AgentConversation.tsx`
- Modify: `src/features/role-brief/components/ClarificationTranscript.tsx`
- Modify: `src/features/role-brief/components/CurrentQuestionCard.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Make the Agent transition depend on the latest answer**

```tsx
const latest = transcript.at(-1);
const transition = latest
  ? `${latest.question.replace("？", "")}已确认。接下来确认${question.prompt.replace("？", "")}：`
  : "我会先用几个简短问题，把候选人范围逐步收敛。";
```

Avoid model reasoning, timings, or hidden chain-of-thought. The text is a short user-facing state summary only.

- [ ] **Step 2: Render historical answers as right-aligned compact Q/A bubbles**

```tsx
<article className="rh-turn">
  <p><span>Q:</span>{turn.question}</p>
  <p><span>A:</span>{turn.answer}</p>
</article>
```

- [ ] **Step 3: Render options as radio-style list rows inside one card**

```tsx
<button className="rh-choice" type="submit">
  <span className="rh-choice-radio" aria-hidden="true" />
  <span>{option}</span>
  <small>{index + 1}</small>
</button>
```

Keep each option in a distinct GET form with hidden `description`, `action="answer"`, `questionId`, and `value` values; this preserves interaction in the local browser without client-side event assumptions.

- [ ] **Step 4: Anchor the question in the lower main column without hiding history**

```css
.rh-stage { display: flex; flex-direction: column; min-height: 0; padding: 28px clamp(32px, 6vw, 108px) 42px; }
.rh-conversation { display: flex; flex: 1; flex-direction: column; margin: 0 auto; max-width: 900px; width: 100%; }
.rh-question-card { margin: auto auto 0; max-width: 720px; width: 100%; }
```

- [ ] **Step 5: Run the conversation test**

Run: `npm.cmd run test -- tests/role-brief/agent-conversation.test.tsx`

Expected: PASS.

### Task 5: Compact the right rail around confirmed criteria — completed

**Files:**
- Modify: `src/features/role-brief/components/ProgressRail.tsx`
- Modify: `src/features/role-brief/components/SearchCriteriaPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Keep exactly four labeled vertical progress states**

```tsx
<section className="rh-progress" aria-label="招聘进展">
  <h2>进展</h2>
  <ol>{items.map((item) => <li className={`is-${item.status}`} key={item.id}>...</li>)}</ol>
</section>
```

- [ ] **Step 2: Limit empty criteria to a single concise pending line**

```tsx
{pendingCriteria.length ? (
  <p className="rh-pending">待补充：{pendingCriteria.slice(0, 3).map((item) => item.label).join("、")}</p>
) : null}
```

- [ ] **Step 3: Use wrap-safe pills only for confirmed multi-value capabilities and exclusions**

```css
.rh-tags span { border-radius: 999px; max-width: 100%; overflow-wrap: anywhere; }
```

- [ ] **Step 4: Run the presentation tests**

Run: `npm.cmd run test -- tests/role-brief/presentation.test.ts`

Expected: PASS.

### Task 6: Validate the full local, safe flow and record the QA result — completed

**Files:**
- Modify: `design-qa.md`
- Modify: `STATUS.md`

- [ ] **Step 1: Run all automated quality gates**

Run: `npm.cmd run test; npm.cmd run typecheck; npm.cmd run lint; npm.cmd run build`

Expected: all commands exit with code 0.

- [ ] **Step 2: Verify the desktop workflow in the in-app browser**

At 2048px-wide desktop viewport, verify these observable states:

1. `/hire` has no right blank rail and shows centered composer.
2. Submitting a valid local description reaches the role route.
3. The role page has a 236px left rail, a right-edge 320px criteria rail, and no white area outside the app shell.
4. Choosing a location produces a Q/A bubble, transition text, the work-model question, and `v2` criteria containing that location.
5. The page makes no network request to a recruitment provider and exposes only local simulation text.

- [ ] **Step 3: Compare the browser capture with the two matching references**

Use the supplied homepage and first-clarification screenshots as visual truth. Place each implementation screenshot next to the matching source before judging typography, rail placement, card density, spacing, icons and copy.

- [ ] **Step 4: Update quality records**

Write `design-qa.md` with the reference paths, implementation capture path, viewport, tested interactions, any remaining P3 notes and `final result: passed`. Update `STATUS.md` to say the new flow is delivered only after the checks pass.

# Inline Candidate Recommendations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep users on the role clarification page after confirmation and reveal a reference-matched, three-person candidate recommendation card beneath the role summary.

**Architecture:** Preserve the existing confirmation API and lifecycle state, but remove the automatic route replacement from `RoleBriefWorkspace`. Pass `roleId` into `AgentConversation`, where a confirmed role conditionally renders the reusable `CandidateRecommendationStage` in an inline variant. Keep the standalone screening route operational and route “全部简历” and “查看简历” into the existing full screening view.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library, CSS, Next Image, Lucide React.

---

### Task 1: Lock the confirmation and recommendation behavior with tests

**Files:**
- Create: `tests/recruiting-workflow/candidate-recommendation-stage.test.tsx`
- Modify: `tests/role-brief/agent-conversation.test.tsx`

- [ ] **Step 1: Add a recommendation-stage test**

Render `CandidateRecommendationStage` with `roleId="role-123"` and `variant="inline"`. Assert that the region contains the heading “推荐候选人”, exactly three candidate articles, an “全部简历” link targeting `/hire/role/role-123?view=screening&mode=all`, and candidate resume links containing `candidate=`.

- [ ] **Step 2: Add an inline confirmation-state test**

Render `AgentConversation` with a role whose `lifecycleState` is `confirmed` and `roleId="role-123"`. Assert that the role summary and “推荐候选人” are both present in document order.

- [ ] **Step 3: Run focused tests and verify the new assertions fail**

Run:

```powershell
npx vitest run tests/recruiting-workflow/candidate-recommendation-stage.test.tsx tests/role-brief/agent-conversation.test.tsx
```

Expected: failure because `variant`, `roleId`, inline rendering, and candidate test selectors are not implemented yet.

### Task 2: Keep confirmation on the current page

**Files:**
- Modify: `src/features/role-brief/components/RoleBriefWorkspace.tsx`
- Modify: `src/features/role-brief/components/AgentConversation.tsx`

- [ ] **Step 1: Remove automatic screening navigation**

Change `handleConfirm` so it returns immediately for an already-confirmed role and otherwise awaits `confirm()` without invoking `enterScreening()`:

```tsx
async function handleConfirm() {
  if (role?.lifecycleState === "confirmed") return;
  await confirm();
}
```

- [ ] **Step 2: Pass the role identifier into the conversation**

Add `roleId={roleId}` to `AgentConversation` in `RoleBriefWorkspace`, and add a required `roleId: string` prop to `AgentConversationProps`.

- [ ] **Step 3: Render recommendations after the summary**

Import `CandidateRecommendationStage` in `AgentConversation` and render:

```tsx
{role.lifecycleState === "confirmed" ? (
  <CandidateRecommendationStage roleId={roleId} variant="inline" />
) : null}
```

Place this immediately after `RoleBriefSummaryCard` so the page retains the complete interaction history.

### Task 3: Make the recommendation card reusable and interactive

**Files:**
- Modify: `src/features/recruiting-workflow/components/CandidateRecommendationStage.tsx`

- [ ] **Step 1: Add the inline variant and batch state**

Define:

```tsx
interface CandidateRecommendationStageProps {
  roleId: string;
  variant?: "page" | "inline";
}
```

Use `useState(0)` for the active batch, split `seedCandidates` into groups of three, and cycle the batch from the “换一批候选人” button without navigation.

- [ ] **Step 2: Preserve reference content and navigation**

Keep three cards with anonymous initials, generated avatar assets, role title, location, experience, match score, three match advantages, and “查看简历”. Change the header action label to “全部简历”. Keep full-list and individual links pointed at `view=screening&mode=all`.

- [ ] **Step 3: Add accessible semantics**

Give the outer section `aria-labelledby`, use a real button for batch refresh, provide descriptive avatar alt text, and keep link/button hit targets at least 44px high.

### Task 4: Add generated anonymous avatar assets

**Files:**
- Create: `public/assets/recruiting/candidate-avatar-female-v2.png`
- Create: `public/assets/recruiting/candidate-avatar-male-v2.png`
- Create: `public/assets/recruiting/ai-pm-avatar.png`

- [ ] **Step 1: Generate three coordinated portraits**

Generate three square, soft-focus professional portraits with low identity detail, neutral office backgrounds, distinct silhouettes and clothing colors, no text, and no logos.

- [ ] **Step 2: Verify image readability**

Inspect each generated image at its final circular 66–72px presentation size and ensure faces remain visually distinct while preserving anonymity.

### Task 5: Match the supplied reference layout

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add inline-container styling**

Add `.recommendation-stage.is-inline` to remove full-viewport minimum height, provide an 18px radius, subtle blue-gray border, and spacing below the role summary.

- [ ] **Step 2: Refine the three-card layout**

Match the reference with a three-column grid, 20–24px card padding, circular avatars, compact match badges, blue bullet markers, thin dividers, and full-width resume buttons.

- [ ] **Step 3: Add reveal and reduced-motion behavior**

Animate only opacity and transform for 180–260ms. Disable the entrance animation under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Preserve responsive behavior**

At 900px and below, switch to one column with no horizontal overflow and retain 44px minimum action heights.

### Task 6: Verify behavior and quality

**Files:**
- Test: `tests/recruiting-workflow/candidate-recommendation-stage.test.tsx`
- Test: `tests/role-brief/agent-conversation.test.tsx`

- [ ] **Step 1: Run focused tests**

```powershell
npx vitest run tests/recruiting-workflow/candidate-recommendation-stage.test.tsx tests/role-brief/agent-conversation.test.tsx tests/role-brief/role-summary-card.test.tsx
```

Expected: all tests pass.

- [ ] **Step 2: Run static checks**

```powershell
npm run typecheck
npm run lint
```

Expected: both commands exit successfully with no new diagnostics.

- [ ] **Step 3: Verify the running application**

Open the current role clarification flow, click “确认”, verify the URL remains on the current role page and the recommendation card appears below the summary. Verify “全部简历” opens the full screening route and each “查看简历” carries the selected candidate ID.

- [ ] **Step 4: Preserve repository state**

Do not create a Git commit unless the user explicitly requests one.

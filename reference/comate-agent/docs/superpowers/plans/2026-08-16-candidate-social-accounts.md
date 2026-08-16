# Candidate Social Accounts Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple social-account list with eight reference-matched account cards and inline expandable account content shared by both resume detail views.

**Architecture:** `CandidateSocialAccounts` remains the single shared component and owns typed account/content data plus local expanded-card state. Both existing resume views already consume it, so no duplicate UI is introduced.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Testing Library

---

### Task 1: Tests and image assets

**Files:**
- Create: `tests/recruiting-workflow/candidate-social-accounts.test.tsx`
- Add: `public/assets/recruiting/social/*`

- [ ] Write tests for eight cards, default 智东西 details, three videos, switching, and collapsing.
- [ ] Run the focused test and confirm it fails against the current component.
- [ ] Crop account avatars and three 智东西 video thumbnails from the supplied screenshots into local assets.

### Task 2: Interactive shared component

**Files:**
- Modify: `src/features/recruiting-workflow/components/CandidateSocialAccounts.tsx`

- [ ] Add typed account and video data for eight accounts.
- [ ] Render the heading, responsive account cards, platform/data metadata, and account action.
- [ ] Add inline expand/collapse state with 智东西 expanded by default.
- [ ] Render account profile and video cards with accessible buttons and links.
- [ ] Run the focused test and confirm it passes.

### Task 3: Responsive styling and verification

**Files:**
- Modify: `src/app/globals.css`

- [ ] Replace the basic account-list styles with two-column cards and a full-row detail panel.
- [ ] Keep two columns in wide resume details and one column in narrow single-review panels.
- [ ] Run the focused test, relevant resume tests, TypeScript, and edited-file diagnostics.

No Git commit will be created unless the user explicitly requests one.

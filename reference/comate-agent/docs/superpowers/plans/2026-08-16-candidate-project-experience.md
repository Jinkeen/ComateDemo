# Candidate Project Experience Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reference-matched project cards to 林澈’s project-experience tab and reuse them in both candidate detail experiences.

**Architecture:** A focused `CandidateProjectExperience` component owns the three demo project records and renders grouped, responsive cards. Both existing resume detail components replace only their current “项目经验” branches with this shared component, so content cannot drift.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Testing Library

---

### Task 1: Shared project experience component

**Files:**
- Create: `src/features/recruiting-workflow/components/CandidateProjectExperience.tsx`
- Create: `tests/recruiting-workflow/candidate-project-experience.test.tsx`
- Add: `public/assets/recruiting/dify-readme-preview.png`
- Add: `public/assets/recruiting/langgenius-profile-preview.png`

- [ ] **Step 1: Write the failing component test**

Render `CandidateProjectExperience` and assert the headings “开源项目 2” and “商业项目 1”, all three project names, and the Dify GitHub and website URLs.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/recruiting-workflow/candidate-project-experience.test.tsx`

Expected: FAIL because `CandidateProjectExperience` does not exist.

- [ ] **Step 3: Add the supplied preview assets**

Copy the supplied Dify README and LangGenius GitHub screenshots into `public/assets/recruiting/` using the filenames above.

- [ ] **Step 4: Implement the shared component**

Create typed project records for:

- `langgenius/dify`
- `langgenius/langgenius`
- `星河智能客服平台`

Render group counts, project icon, badge, description, language/repository metadata, technology tags, external links, and an optional right-aligned preview image. Use real text and links; images contain only the supplied product previews.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- tests/recruiting-workflow/candidate-project-experience.test.tsx`

Expected: PASS.

### Task 2: Synchronize both resume detail views

**Files:**
- Modify: `src/features/recruiting-workflow/components/CandidateApprovalStage.tsx`
- Modify: `src/features/recruiting-workflow/components/CandidateResumeDetail.tsx`
- Modify: `tests/recruiting-workflow/candidate-project-experience.test.tsx`

- [ ] **Step 1: Add integration tests**

Render `CandidateApprovalStage` and `CandidateResumeDetail`, activate “项目经验”, and assert each view displays `langgenius/dify`, `langgenius/langgenius`, and `星河智能客服平台`.

- [ ] **Step 2: Run the test and verify the new assertions fail**

Run: `npm test -- tests/recruiting-workflow/candidate-project-experience.test.tsx`

Expected: FAIL because both views still render their old project copy.

- [ ] **Step 3: Replace only the project-experience branches**

Import and render `CandidateProjectExperience` from both existing components. Leave work history, education, skills, self-review, profile, and side cards unchanged.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- tests/recruiting-workflow/candidate-project-experience.test.tsx`

Expected: PASS.

### Task 3: Reference-matched responsive styling

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add project grouping and card styles**

Add scoped `.candidate-project-*` rules for section headings, bordered cards, icon area, metadata, links, tags, preview images, hover feedback, and responsive card stacking.

- [ ] **Step 2: Preserve usable density**

Keep the preview at roughly 30% of card width on wide detail panels, cap its height, and hide or stack it below the content where the single-review panel becomes narrow.

- [ ] **Step 3: Run verification**

Run:

- `npm test -- tests/recruiting-workflow/candidate-project-experience.test.tsx`
- `npm test -- tests/recruiting-workflow/candidate-review-stage.test.tsx`
- `npm run typecheck`

Expected: all commands pass.

- [ ] **Step 4: Check edited-file diagnostics**

Confirm no new diagnostics in the shared component, both consumers, the test, and `globals.css`.

No Git commit will be created unless the user explicitly requests one.

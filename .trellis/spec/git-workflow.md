# Git Workflow

## Branches

`main` always contains a demonstrable build. Each member creates a short lived feature branch from the latest `main`:

```text
feature/recruiter-screening
feature/interview-flow
feature/candidate-experience
```

Member A maintains public routes and shared domain contracts. Member C reviews visual consistency. Any member may propose shared changes through a focused pull request.

## Daily flow

1. Pull `main` before starting.
2. Check the assigned Trellis task.
3. Commit one coherent feature at a time.
4. Push the feature branch and open a pull request.
5. Run `npm run lint` and `npm run build` before merge.
6. Merge at least once each day to expose integration issues early.

Use conventional messages such as `feat: add resume screening states`, `fix: align candidate route`, and `docs: update UI tokens`.

## Conflict control

Avoid concurrent edits to `src/App.tsx`, `src/types/domain.ts`, `src/styles/global.css`, and shared components. Announce the intended change before editing one of these files. Feature code belongs in its own page or feature directory.

Do not commit `.trellis/.developer`, `.trellis/.runtime`, environment secrets, generated `dist`, or local editor settings.

## Pull request checklist

Confirm the target journey works, mock data is deterministic, shared visual components are reused, types pass, the build succeeds, and another member can reach the page from the role portal.

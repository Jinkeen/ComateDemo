# Git Workflow

## Branches

`main` always contains a demonstrable browser build. Each member creates a short lived feature branch from the latest `main`:

```text
feature/recruiter-screening
feature/interview-flow
feature/candidate-experience
```

Member A coordinates changes to shared routing and mock data. Member C reviews visual consistency.

## Daily flow

1. Pull `main` before starting.
2. Check the assigned Trellis task.
3. Commit one coherent feature at a time.
4. Push the branch and open a pull request.
5. Open `index.html` with VS Code Live Server and test both identities before merge.
6. Merge at least once each day.

Avoid concurrent edits to `index.html`, `assets/js/app.js`, `assets/js/mock-data.js`, and `assets/css/styles.css`. Announce shared changes before editing these files.

Do not commit `.trellis/.developer`, `.trellis/.runtime`, secrets, or local editor settings.

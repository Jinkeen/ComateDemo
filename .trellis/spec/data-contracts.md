# Data Contracts

## Source of truth

Shared demo records live in `assets/js/mock-data.js` under `window.COMATE_MOCK`. Rendering and interaction logic lives in `assets/js/app.js`. When a backend is added, create `assets/js/services/` and replace direct mock reads with async service functions.

## Core records

A job contains `id`, `title`, `summary`, and `mustHave`. A candidate contains `id`, `name`, `title`, `tags`, `score`, and `priority`. Future interview records contain a candidate ID, time, and status. Agent events contain `agent`, `action`, and `status`.

Use stable string IDs. Time values use ISO 8601 with an explicit timezone. Candidate priority uses the same agreed strings across both ends.

## Change policy

Changes to shared data shapes require a short team review. Add fields when a real screen needs them. Avoid duplicate candidate objects, array indexes as IDs, and inconsistent status labels.

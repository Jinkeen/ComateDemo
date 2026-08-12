# Directory Structure

`src/pages` owns route level composition. `src/components` contains reusable visual building blocks. `src/types` owns cross feature domain contracts. `src/mocks` contains deterministic demo records. `src/services` exposes async interfaces used by pages and features. `src/styles/global.css` contains tokens and shared layout styles.

`src/App.tsx` is the route registry. Member A coordinates changes to this file. New complex modules should be placed under `src/features/<feature-name>/` with their private components and hooks.

Use PascalCase for React files, camelCase for services and data modules, and lower case route segments. Keep feature specific code out of `src/components`.

Current references: `src/App.tsx`, `src/components/AppShell.tsx`, `src/services/candidateService.ts`.

# Type Safety

TypeScript strict mode is enabled in `tsconfig.app.json`. Shared entities and stable unions live in `src/types/domain.ts`. Component props are declared explicitly and service methods return typed Promises.

Prefer unions for finite statuses and roles. Use `interface` for domain records and service contracts. Validate route parameters and optional service results before rendering detail views.

Avoid `any`, duplicated entity shapes, unchecked type assertions, and string statuses that bypass the shared unions.

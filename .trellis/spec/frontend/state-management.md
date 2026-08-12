# State Management

Use component state for temporary UI state, route parameters for navigable state, and services for domain records. The selected demo role is stored in `localStorage` by `src/pages/RolePortalPage.tsx` only to support quick role switching.

No global state library is installed. Introduce one only after multiple distant routes require synchronized mutable state. Keep mock records immutable and deterministic in `src/mocks/demoData.ts`.

Do not read mock modules directly from visual components. Access them through a service such as `src/services/candidateService.ts`.

# Component Guidelines

Use typed function components and named exports. Shared primitives accept focused props and preserve native element attributes where useful, as shown in `src/components/Button.tsx`.

Compose pages with `Card`, `Button`, `StatusBadge`, and `AppShell`. Keep data access outside presentation components. Page components may coordinate service calls and pass typed records downward.

Reuse CSS classes and variables from `src/styles/global.css`. Avoid duplicated sidebar markup, untyped props, deeply nested conditional rendering, and feature specific behavior inside shared primitives.

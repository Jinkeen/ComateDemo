# UI Guidelines

## Visual direction

Use a calm AI productivity style with generous white space, soft lavender surfaces, purple primary actions, and cyan accents. The implemented source of truth is `src/styles/global.css`.

Core tokens:

| Token | Value |
| --- | --- |
| Primary | `#6c63ff` |
| Accent | `#22c7c9` |
| Page background | `#f6f7fb` |
| Surface | `#ffffff` |
| Text | `#202235` |
| Muted text | `#6f7388` |
| Border | `#e7e8f0` |
| Card radius | `16px` |

## Layout

The role portal is centered and uses two identity cards. Recruiter and candidate workspaces use `src/components/AppShell.tsx`. Desktop pages use a left navigation and a content width up to 1280 pixels. Screens below 760 pixels collapse to a single content column.

## Shared components

Reuse `Button`, `Card`, `StatusBadge`, and `AppShell`. New variants should extend these components and the CSS variables. Feature pages should not introduce a second sidebar, a competing primary color, or inline copies of shared button styles.

## Interaction

Primary actions use purple. Cyan is reserved for candidate identity, highlights, and positive AI states. Every clickable card or button needs a visible hover or active state. Demo actions must provide immediate feedback through navigation, a status badge, progress state, or updated mock content.

## Content

Use concise Chinese product copy. AI conclusions should show evidence, confidence, or status when relevant. Sensitive attributes such as age, gender, photo, ethnicity, and marital status must not appear in screening scores.

UI reference screenshots should be stored under `docs/ui-reference/` once the team selects them.

# JavaScript Behavior Guidelines

This project does not use React hooks. Browser behavior lives in focused functions inside `assets/js/app.js` or a feature file under `assets/js/features/`.

Use DOM events for interactions, hash changes for navigable state, and plain functions for rendering. Keep event registration close to the rendered elements and rebind after each route render when necessary.

Avoid global mutable state. The only shared global is `window.COMATE_MOCK`, which contains read only demo records.

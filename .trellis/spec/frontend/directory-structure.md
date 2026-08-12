# Directory Structure

This demo uses native HTML, CSS, and JavaScript.

`index.html` is the single browser entry. `assets/css/styles.css` owns shared tokens, layout, and responsive styles. `assets/js/app.js` owns hash routing and page rendering. `assets/js/mock-data.js` owns deterministic demo records. Future feature modules should be added under `assets/js/features/` when `app.js` becomes difficult to review.

Use kebab case for folders and CSS classes, camelCase for JavaScript functions and values, and stable lower case hash routes such as `#recruiter/screening`.

Avoid framework dependencies, inline page styles, duplicated navigation, and feature data embedded directly inside rendering functions.

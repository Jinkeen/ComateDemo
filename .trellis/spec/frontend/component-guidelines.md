# Component Guidelines

The demo uses small JavaScript render functions and reusable CSS classes. Shared visual patterns include `.card`, `.badge`, `.tag`, `.sidebar`, and `.page-heading` in `assets/css/styles.css`.

Add a render function when a repeated UI block needs dynamic data. Keep mock data in `assets/js/mock-data.js`. Use semantic HTML elements and `data-route` only for internal demo navigation.

Avoid copying full layouts between pages, introducing a second primary color, and building custom controls when a native button or link is sufficient.

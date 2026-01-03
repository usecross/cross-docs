---
release type: minor
---

# Migrate to Tailwind CSS v4

This release migrates Cross-Docs to Tailwind CSS v4's CSS-based configuration, replacing the JavaScript preset approach.

## Breaking Changes

- Removed `@usecross/docs/tailwind.preset` export
- Removed support for Tailwind CSS v3

## Migration Guide

Update your CSS file to use the new v4 pattern:

```css
/* Before (v3) - tailwind.config.js */
const docsPreset = require('@usecross/docs/tailwind.preset')
module.exports = {
  presets: [docsPreset],
  // ...
}

/* After (v4) - styles.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
@import '@usecross/docs/styles.css';
@source "../node_modules/@usecross/docs";
```

To customize the primary color, use a `@theme` block:

```css
@theme {
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  /* Add more shades as needed */
}
```

You can remove your `tailwind.config.js` file entirely if it was only used for the Cross-Docs preset.

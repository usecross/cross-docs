---
release type: minor
---

Migrate to Tailwind CSS v4

This release completes the migration to Tailwind CSS v4:

- Updated `tailwindcss` peer dependency to `^4.0.0`
- Website now uses `@tailwindcss/vite` plugin instead of PostCSS
- Updated important modifier syntax from v3 format (`!property`) to v4 format (`property!`)
- Added `@reference "tailwindcss"` directive to library styles for proper v4 support
- Removed `autoprefixer` and `postcss` dependencies (built into Tailwind v4)

CHANGELOG
=========

0.8.2 - 2026-01-04
------------------

# Reposition docs footer outside sidebar

Move the docs page footer to align with the content area rather than spanning the full page width. Similar to Tailwind's docs layout, the footer now:

- Starts after the left sidebar (not underneath it)
- Spans to the right edge of the page (including under the TOC area)
- Aligns footer content with logo on the left and links on the right

0.8.1 - 2026-01-04
------------------

# Consistent TOC styling

Updated the "On this page" table of contents component to use the same visual styles as the sidebar navigation for a more cohesive look.

0.8.0 - 2026-01-04
------------------

# Table of Contents Support

Adds a "On This Page" table of contents sidebar for documentation pages, similar to Tailwind's docs.

## Features

- Automatic TOC extraction from markdown H2 and H3 headings
- Scroll spy that highlights the current section as you scroll
- Smooth scroll navigation when clicking TOC items
- Proper handling of edge cases (bottom of page, URL hash on load)
- Right sidebar on xl+ screens (hidden on smaller viewports)

## New Components

- `TableOfContents` - Renders the TOC with scroll spy functionality

## Changes

- `markdown.py` - Added `slugify()` and `extract_toc()` functions
- `Markdown.tsx` - Heading components now generate matching anchor IDs
- `DocsLayout.tsx` - Added right sidebar for TOC display
- `DocsPage.tsx` - Passes TOC data to layout
- `types.ts` - Added `TOCItem` and `TableOfContentsProps` types

0.7.0 - 2026-01-04
------------------

# Multi-docs selector

Add support for hosting multiple documentation sets with a dropdown selector in the sidebar.

## Features

- **Doc set selector**: Dropdown in sidebar to switch between documentation sets (e.g., "Strawberry" and "Strawberry Django")
- **Separate navigation**: Each doc set has completely independent navigation
- **Flexible configuration**: Configure via `[[tool.cross-docs.doc_sets]]` in pyproject.toml
- **Backwards compatible**: Single-docs mode works unchanged when `doc_sets` is not configured

## Configuration

```toml
[[tool.cross-docs.doc_sets]]
name = "Strawberry"
slug = ""  # Root: /docs/
description = "GraphQL library for Python"
icon_url = "/static/strawberry.svg"
content_subdir = "strawberry"
index_page = "introduction"

[[tool.cross-docs.doc_sets]]
name = "Strawberry Django"
slug = "django"  # /docs/django/
description = "Django integration"
icon_url = "/static/django.svg"
content_subdir = "django"
index_page = "index"
```

## New exports

- `DocSet`: Dataclass for configuring individual documentation sets
- `DocSetSelector`: React component for the dropdown selector
- `DocSetMeta`: TypeScript interface for doc set metadata

0.6.0 - 2026-01-03
------------------

# Dark Mode Support

Add dark mode support with theme toggle and configurable footer logos.

## New Features

- **Theme Toggle**: New `ThemeProvider` and `ThemeToggle` components for light/dark/system theme switching
- **Dark Footer Logo**: New `footer_logo_inverted_url` config option for dark mode footer logos
- **Theme Hook**: New `useTheme()` hook to access current theme state in custom components

## Configuration

```toml
[tool.cross-docs]
footer_logo_url = "/static/logo.svg"
footer_logo_inverted_url = "/static/logo-dark.svg"
```

## Developer Experience

- Vite now uses source files directly for hot-reloading during development

0.5.0 - 2026-01-03
------------------

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

0.4.2 - 2026-01-03
------------------

Fix missing bottom margin on code blocks

Code blocks using `not-prose` were missing bottom margins, causing headings that follow to appear cramped against the code block. Added `mb-6` to the CodeBlock wrapper for proper spacing.

Also removes accidentally committed `website/frontend/dist/` build artifacts from git tracking.

0.4.1 - 2026-01-02
------------------

# Update for cross-inertia module rename

Updates all imports from `inertia` to `cross_inertia` to match the upstream module rename in cross-inertia v0.11.0.

See: https://github.com/usecross/cross-inertia/pull/76

0.4.0 - 2026-01-02
------------------

# Add Custom React Components Support in Markdown

This release adds support for passing custom React components that can be embedded in markdown content. Users can now provide a `components` object in their `DocsAppConfig` to extend markdown rendering with custom components like alerts, cards, terminal examples, and more.

## New Features

- **Custom Components in Markdown**: Pass custom React components through `DocsAppConfig` that can be used directly in markdown files
- **ComponentsContext**: New context provider for managing custom components across the app
- **Automatic Tag Mapping**: Custom components are automatically mapped to lowercase HTML tag names to match standard HTML behavior

## Usage Example

```typescript
import { createDocsApp } from '@usecross/cross-docs'
import { Alert } from './components/Alert'
import { Card } from './components/Card'

createDocsApp({
  pages: import.meta.glob('./pages/**/*.tsx', { eager: true }),
  components: {
    Alert,
    Card,
  },
})
```

Then in your markdown:
```markdown
<alert type="warning">
This is a custom alert component!
</alert>
```

## Breaking Changes

None. This is a backward-compatible addition.

0.3.0 - 2025-12-16
------------------

Migrate to Tailwind CSS v4

This release completes the migration to Tailwind CSS v4:

- Updated `tailwindcss` peer dependency to `^4.0.0`
- Website now uses `@tailwindcss/vite` plugin instead of PostCSS
- Updated important modifier syntax from v3 format (`!property`) to v4 format (`property!`)
- Added `@reference "tailwindcss"` directive to library styles for proper v4 support
- Removed `autoprefixer` and `postcss` dependencies (built into Tailwind v4)

0.2.8 - 2025-12-16
------------------

# Fix CI build issues

## Summary

This patch fixes the automated release process by addressing two issues that were preventing successful builds and publishing.

## Changes

- Removed local editable path to `cross-inertia` from `website/pyproject.toml`
- Regenerated `uv.lock` to use the published PyPI version of `cross-inertia` instead
- Fixed `autopub_bun` plugin to explicitly set build output directory to avoid workspace issues

## Context

### Issue 1: Local dependency path

The first release attempt failed because `website/pyproject.toml` had a `[tool.uv.sources]` override pointing to a local development path (`../../../patrick91/cross-inertia`) that doesn't exist in the CI environment. This caused `uv lock` to fail during the autopub prepare step.

### Issue 2: Workspace build directory

After fixing the local dependency issue, the second release attempt failed during publishing with "No files found to publish". This occurred because `uv build` when run from a workspace member directory (`python/`) outputs to the workspace root `dist/` directory by default, but `uv publish` looks for files in the member's `dist/` directory.

The fix adds `--out-dir dist` to the `uv build` command to ensure files are built in the correct location.

0.2.7 - 2025-12-08
------------------

Add EmojiConfetti component

- Add reusable EmojiConfetti component for hover-triggered emoji burst animations
- Include required CSS keyframes animation in styles.css

0.2.6 - 2025-12-07
------------------

Test autopub publish with git plugin

- Verify autopub publish handles both package publishing and git operations
- CrossDocsPlugin publishes to PyPI and npm with OIDC
- Git plugin commits version changes, tags, and pushes
CHANGELOG
=========

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
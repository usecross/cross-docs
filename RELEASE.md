---
release type: patch
---

# Fix CI build by removing local dependency override

## Summary

This patch fixes the automated release process by removing a local development dependency override that was causing CI builds to fail.

## Changes

- Removed local editable path to `cross-inertia` from `website/pyproject.toml`
- Regenerated `uv.lock` to use the published PyPI version of `cross-inertia` instead

## Context

The previous release failed in CI because `website/pyproject.toml` had a `[tool.uv.sources]` override pointing to a local development path (`../../../patrick91/cross-inertia`) that doesn't exist in the CI environment. This caused `uv lock` to fail during the autopub prepare step.

The fix ensures that the published version from PyPI is used in both development and CI environments.

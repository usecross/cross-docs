---
release type: minor
---

Add zero-config SSR support to CrossDocs

- `CrossDocs` now accepts FastAPI kwargs and exposes a fully configured `app` property with Inertia, SSR, static files, and routing wired up automatically
- Fix SSR hydration mismatch by wrapping SSR setup with `ComponentsProvider` to match client-side tree
- Fix SSR crash from duplicate `ThemeContext` in bundled builds by returning safe defaults during SSR

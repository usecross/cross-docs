---
release type: minor
---

Upgrade dependencies and adopt Oxlint

- Upgrade the JavaScript and Python dependency stacks, including Shiki 4, Vite 8, TypeScript 7, FastAPI 0.141, and Cross-Inertia 0.20
- Replace the non-functional ESLint placeholder with shared Oxlint checks for the SDK and documentation website
- Generate SDK declarations directly with TypeScript for TypeScript 7 compatibility
- Improve keyboard and screen-reader support for copyable code and mobile navigation backdrops
- Consolidate package manager state into the root Bun and uv workspace lockfiles

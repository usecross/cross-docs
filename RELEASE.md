---
release type: patch
---

Fix SSR command to use pybun instead of bun

- Use `sys.executable -m pybun` for the SSR command so it works in production environments where `bun` is not on PATH
- Add `pybun>=1.0.0` as a dependency

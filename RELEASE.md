---
release type: patch
---

Refactor to single CrossDocsPlugin

- Consolidate BunPlugin and UvMonorepoPlugin into CrossDocsPlugin
- Simplify workflow to use autopub build/publish commands
- OIDC trusted publishing for both PyPI and npm

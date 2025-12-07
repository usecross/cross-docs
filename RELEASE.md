Release type: patch

Fix release workflow and npm OIDC trusted publishing.

- Simplify workflow to single release job
- Add publishConfig with provenance in package.json
- Use Node 24.x for npm publish (workaround for npm CLI bug)
- Create GitHub release using gh CLI

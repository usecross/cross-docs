Release type: patch

Fix npm OIDC trusted publishing for scoped packages.

- Add publishConfig with provenance in package.json
- Use Node 24.x for npm publish (workaround for npm CLI bug)
- Add NPM_CONFIG_PROVENANCE environment variable

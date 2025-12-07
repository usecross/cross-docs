# Website Development Notes

This document captures the setup process and issues encountered while creating the cross-docs documentation website.

## Overview

The website uses cross-docs to document itself - a "dogfooding" approach that helps validate the library.

## Architecture

```
cross-docs/
├── package.json          # Bun workspace root
├── js/                   # @usecross/docs React package
├── python/               # cross-docs Python package
└── website/              # Documentation website
    ├── app.py            # FastAPI backend
    ├── frontend/         # React frontend
    ├── content/docs/     # Markdown documentation
    └── templates/        # Jinja2 templates
```

## Key Setup Decisions

### Bun Workspaces

We use a bun workspace at the monorepo root to link `@usecross/docs`:

```json
// cross-docs/package.json
{
  "workspaces": ["js", "website"]
}
```

This allows the website to use `"@usecross/docs": "workspace:*"` and have bun handle the linking.

### Conditional Exports (Development vs Production)

The `js/package.json` uses conditional exports to support both development and production:

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

**How it works:**

| Environment | Resolves to | Build required? |
|-------------|-------------|-----------------|
| Vite dev server | `src/*.ts` | No |
| npm consumers | `dist/*.js` | Yes |

- **Development**: Vite and other modern bundlers support the `development` condition, resolving imports to source files for hot reload
- **Production**: The `default` condition kicks in, using built `dist/` files

This eliminates the trade-off between dev experience and npm publishing - both work automatically.

**References:**
- [Node.js Conditional Exports Documentation](https://nodejs.org/api/packages.html#conditional-exports)
- [Webpack Package Exports Guide](https://webpack.js.org/guides/package-exports/)

## Library Improvement Ideas

Based on this experience, here are suggestions for improving cross-docs:

### For cross-docs (Python)

1. **Document template requirements** - The template needs `{{ page | safe }}` not `{{ page | tojson }}`. Document this clearly.

2. **Provide example templates** - Ship an example `app.html` template that users can copy.

### For Documentation

1. **Add a "dogfooding" section** - Show how to use cross-docs in a monorepo to document itself.

2. **Document workspace setup** - Explain the bun workspace configuration for monorepo usage.

3. **Troubleshooting guide** - Document common errors like the JSON double-encoding issue.

## Running the Website

```bash
cd website
just setup  # Install dependencies
just dev    # Run frontend + backend
```

Visit http://localhost:8000/docs

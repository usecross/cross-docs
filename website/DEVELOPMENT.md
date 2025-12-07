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

## Issues Encountered & Solutions

### 1. Workspace Resolution

**Problem:** `workspace:*` wasn't working initially.

**Cause:** The `package.json` with workspaces config needs to be at the monorepo root, not in the website folder.

**Solution:** Created `/cross-docs/package.json` with `"workspaces": ["js", "website"]`.

### 2. Missing lib/ Directory

**Problem:** Vite couldn't resolve `./lib/utils` and `./lib/shiki` imports.

**Cause:** The `js/src/lib/` directory was missing from the repo - the source files referenced utilities that didn't exist.

**Solution:** Created the missing files:
- `js/src/lib/utils.ts` - `cn()` utility using clsx + tailwind-merge
- `js/src/lib/shiki.ts` - Shiki highlighter singleton with configuration

### 3. Double JSON Encoding

**Problem:** `Page component "undefined" not found` error.

**Cause:** The template used `{{ page | tojson }}` but cross-inertia already passes `page` as a JSON string. This caused double-encoding: `'"{\"component\": ...}"'`

**Solution:** Changed template to `{{ page | safe }}` since the value is already JSON.

```html
<!-- Before (wrong) -->
<div id="app" data-page='{{ page | tojson }}'></div>

<!-- After (correct) -->
<div id="app" data-page='{{ page | safe }}'></div>
```

### 4. FastAPI /docs Conflict

**Problem:** FastAPI's built-in Swagger UI at `/docs` conflicted with our documentation routes.

**Solution:** Move FastAPI's API docs to a different path:

```python
app = FastAPI(docs_url="/api/docs", redoc_url="/api/redoc")
```

### 5. Shiki Theme Not Loaded

**Problem:** `ShikiError: Theme 'github-dark-dimmed' not found`

**Cause:** The CodeBlock component defaults to `github-dark-dimmed` but the shiki config only loaded `github-dark` and `github-light`.

**Solution:** Added `github-dark-dimmed` to the default themes in `lib/shiki.ts`.

### 6. CSS Import Order

**Problem:** PostCSS error: `@import must precede all other statements`

**Solution:** Put `@import` before `@tailwind` directives:

```css
@import '@usecross/docs/styles.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 7. InertiaMiddleware Signature

**Problem:** `TypeError: InertiaMiddleware.__init__() missing 1 required positional argument: 'share'`

**Solution:** The middleware requires a share function:

```python
app.add_middleware(InertiaMiddleware, share=lambda request: {})
```

## Library Improvement Ideas

Based on this experience, here are suggestions for improving cross-docs:

### For @usecross/docs (JS)

1. **Ship lib/ files** - The `lib/utils.ts` and `lib/shiki.ts` files were missing. Ensure these are included in the package.

2. **Document shiki themes** - Make it clear which themes are loaded by default and how to configure them.

3. ~~**Consider bundling for npm**~~ - ✅ Resolved! Now using conditional exports with `development` condition for source files and `default` for built dist files.

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

---
release type: minor
---

# Add API Documentation Support

This release adds comprehensive API documentation support using Griffe for Python code analysis.

## New Features

- **API Documentation Plugin System**: Extensible plugin architecture for generating API docs from source code
- **Python Plugin**: Extract API documentation from Python packages using Griffe with support for Google, NumPy, and Sphinx docstring styles
- **CLI Command**: `cross-docs generate-api` to generate API documentation JSON
- **React Components**: Full set of components for rendering API docs:
  - `APIPage` / `APILayout` - Main page and layout with separate sidebar
  - `ModuleDoc` / `ClassDoc` / `FunctionDoc` - Documentation renderers
  - `Signature` / `Docstring` / `ParameterTable` - Specialized display components
- **Sidebar Improvements**: Collapsible sections and compact mode for large navigation structures
- **Custom Header Support**: `APILayout` accepts custom header/footer components for branding

## Configuration

Add to your `pyproject.toml`:

```toml
[[tool.cross-docs.api]]
plugin = "python"
package = "my_package"
prefix = "/api"
docstring_parser = "google"
```

## Bug Fixes

- Fixed API sidebar navigation URLs to use slashes instead of dots (e.g., `/api/pkg/module/` instead of `/api/pkg.module`)

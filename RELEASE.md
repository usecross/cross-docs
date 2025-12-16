---
release_type: minor
---

# Refactor to CrossDocs class

This release introduces a simpler, more intuitive API by replacing the old route factory functions with a unified `CrossDocs` class.

## Breaking Changes

The following route factory functions have been removed from the public API:
- `create_docs_router()`
- `create_docs_router_from_config()`
- `create_docs_handler()`
- `create_home_route()`

## Migration Guide

**Before:**
```python
from cross_docs import create_docs_router_from_config, create_home_route, load_config

config = load_config()
docs_router = create_docs_router_from_config(config)
app.include_router(docs_router)

home_handler = create_home_route(config)

@app.get("/")
async def home(request: Request, inertia: InertiaDep):
    return await home_handler(request, inertia)
```

**After:**
```python
from cross_docs import CrossDocs

docs = CrossDocs()
docs.mount(app)
```

## New Features

- **Unified `CrossDocs` class**: Simpler API that automatically handles both docs and home routes
- **Auto-configuration**: Automatically loads configuration from pyproject.toml
- **Component customization**: Override component names via constructor parameters:
  ```python
  docs = CrossDocs(
      docs_component="custom/DocsPage",
      home_component="custom/HomePage",
  )
  ```

## Other Changes

- Added `component` field to `HomeConfig` for customizing the home page component
- Moved `.fastapicloudignore` to website directory
- Updated dependencies (fastapi 0.124.4, urllib3 2.6.2)

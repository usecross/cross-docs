---
release type: minor
---

# Multi-docs selector

Add support for hosting multiple documentation sets with a dropdown selector in the sidebar.

## Features

- **Doc set selector**: Dropdown in sidebar to switch between documentation sets (e.g., "Strawberry" and "Strawberry Django")
- **Separate navigation**: Each doc set has completely independent navigation
- **Flexible configuration**: Configure via `[[tool.cross-docs.doc_sets]]` in pyproject.toml
- **Backwards compatible**: Single-docs mode works unchanged when `doc_sets` is not configured

## Configuration

```toml
[[tool.cross-docs.doc_sets]]
name = "Strawberry"
slug = ""  # Root: /docs/
description = "GraphQL library for Python"
icon_url = "/static/strawberry.svg"
content_subdir = "strawberry"
index_page = "introduction"

[[tool.cross-docs.doc_sets]]
name = "Strawberry Django"
slug = "django"  # /docs/django/
description = "Django integration"
icon_url = "/static/django.svg"
content_subdir = "django"
index_page = "index"
```

## New exports

- `DocSet`: Dataclass for configuring individual documentation sets
- `DocSetSelector`: React component for the dropdown selector
- `DocSetMeta`: TypeScript interface for doc set metadata

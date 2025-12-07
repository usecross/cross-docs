---
title: Python API
description: Python API reference for cross-docs
section: API Reference
order: 1
---

# Python API

The `cross-docs` Python package provides utilities for building documentation backends with FastAPI.

## create_docs_router

Create a FastAPI router with documentation routes.

```python
from pathlib import Path
from cross_docs import create_docs_router

router = create_docs_router(
    content_dir=Path("content"),
    component="docs/DocsPage",
    prefix="/docs",
    index_page="introduction",
    section_order=["Getting Started", "Guide", "API Reference"],
    enable_markdown_response=True,
    logo_url="/static/logo.svg",
    github_url="https://github.com/org/repo",
    nav_links=[{"label": "Docs", "href": "/docs"}],
)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `content_dir` | `Path` | required | Base directory for content |
| `component` | `str` | `"docs/DocsPage"` | Inertia component name |
| `prefix` | `str` | `"/docs"` | URL prefix for docs routes |
| `index_page` | `str` | `"introduction"` | Index page filename (without .md) |
| `section_order` | `list[str]` | `None` | Order of navigation sections |
| `enable_markdown_response` | `bool` | `True` | Enable raw markdown for AI tools |
| `logo_url` | `str` | `None` | URL for site logo |
| `logo_inverted_url` | `str` | `None` | URL for inverted/dark logo |
| `github_url` | `str` | `None` | GitHub repository URL |
| `nav_links` | `list[dict]` | `None` | Additional nav links |

## generate_nav

Generate navigation structure from markdown files.

```python
from cross_docs import generate_nav

nav = generate_nav(
    docs_dir=Path("content/docs"),
    base_path="/docs",
    section_order=["Getting Started", "Guide"],
    index_page="introduction",
)
```

Returns a list of navigation sections with items.

## parse_frontmatter

Parse YAML frontmatter from markdown content.

```python
from cross_docs import parse_frontmatter

frontmatter, body = parse_frontmatter(markdown_content)
# frontmatter = {"title": "...", "section": "..."}
# body = "# Markdown content..."
```

## load_markdown

Load and parse a markdown file.

```python
from cross_docs import load_markdown

content = load_markdown(Path("content"), "docs/introduction")
# Returns: {"title": "...", "body": "...", "description": "..."}
```

## wants_markdown

Check if a request wants raw markdown (for AI tools).

```python
from cross_docs import wants_markdown

if wants_markdown(request):
    return PlainTextResponse(raw_markdown, media_type="text/markdown")
```

This checks for `Accept: text/markdown` header or `?format=markdown` query param.

## strip_trailing_slash_middleware

Redirect URLs with trailing slashes.

```python
from cross_docs import strip_trailing_slash_middleware

app.middleware("http")(strip_trailing_slash_middleware)
```

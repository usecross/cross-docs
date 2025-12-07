---
title: Markdown Features
description: Supported markdown features and syntax
section: Guide
order: 2
---

# Markdown Features

Cross-Docs supports GitHub Flavored Markdown with additional features.

## Frontmatter

Every markdown file should have YAML frontmatter:

```yaml
---
title: Page Title
description: Brief description for SEO
section: Section Name
order: 1
---
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Page title |
| `description` | No | SEO description |
| `section` | Yes | Navigation section name |
| `order` | No | Order within section (default: alphabetical) |

## Code blocks

Syntax highlighting is powered by Shiki with support for many languages:

```python
from cross_docs import create_docs_router

router = create_docs_router(Path("content"))
```

```typescript
import { createDocsApp } from '@usecross/docs'

createDocsApp({
  pages: { 'docs/DocsPage': DocsPage },
})
```

```bash
uv add cross-docs
npm install @usecross/docs
```

## Tables

| Feature | Status |
|---------|--------|
| Tables | Supported |
| GFM | Supported |
| Syntax highlighting | Supported |

## Lists

Ordered lists:

1. First item
2. Second item
3. Third item

Unordered lists:

- Item one
- Item two
- Item three

## Links

- [Internal link](/docs/installation)
- [External link](https://github.com/usecross/cross-docs)

## Emphasis

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `inline code`

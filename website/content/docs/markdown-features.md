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

## Task Lists

Create interactive checklists:

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another todo item

## Emoji

Use GitHub-style emoji codes:

- :rocket: Launch day!
- :sparkles: New feature
- :bug: Bug fix
- :heart: Love it
- :warning: Be careful

## Footnotes

Add references with footnotes[^1]. You can also use named footnotes[^note].

[^1]: This is the first footnote.
[^note]: Named footnotes work great for longer references.

## Alerts

GitHub-style alerts for highlighting important information:

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

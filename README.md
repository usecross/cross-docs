# Cross-Docs

Documentation framework built on Cross-Inertia. Build beautiful documentation sites with Python backends and React frontends.

## Features

- **Markdown-based content** with frontmatter support
- **Auto-generated navigation** from file structure
- **Server-side rendering** for SEO and performance
- **Syntax highlighting** with Shiki
- **Raw markdown responses** for AI tools (Claude Code, etc.)
- **Fully customizable** components and theming

## Packages

This monorepo contains two packages:

| Package | Description | Registry |
|---------|-------------|----------|
| `cross-docs` | Python backend utilities | [PyPI](https://pypi.org/project/cross-docs/) |
| `@usecross/docs` | React components and utilities | [npm](https://www.npmjs.com/package/@usecross/docs) |

## Quick Start

### 1. Install packages

```bash
# Python
uv add cross-docs

# JavaScript
npm install @usecross/docs
```

### 2. Create your backend (FastAPI)

```python
from pathlib import Path
from fastapi import FastAPI, Request
from cross_docs import (
    generate_nav,
    create_docs_handler,
    strip_trailing_slash_middleware,
)
from inertia.fastapi import InertiaMiddleware, InertiaDep

app = FastAPI()
app.middleware("http")(strip_trailing_slash_middleware)

CONTENT_DIR = Path("content")
NAV = generate_nav(CONTENT_DIR / "docs")

docs_handler = create_docs_handler(CONTENT_DIR, NAV)

@app.get("/docs")
async def docs_index(request: Request, inertia: InertiaDep):
    return await docs_handler(request, inertia)

@app.get("/docs/{path:path}")
async def docs_page(path: str, request: Request, inertia: InertiaDep):
    return await docs_handler(request, inertia, path=path)
```

### 3. Create your frontend

```tsx
// app.tsx
import { createDocsApp, DocsPage } from '@usecross/docs'
import './globals.css'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
  title: (title) => `${title} - My Docs`,
})
```

### 4. Configure Tailwind

```javascript
// tailwind.config.js
const docsPreset = require('@usecross/docs/tailwind.preset')

module.exports = {
  presets: [docsPreset],
  content: [
    './frontend/**/*.{ts,tsx}',
    './node_modules/@usecross/docs/**/*.{js,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // Your brand colors
          500: '#648C57',
          600: '#4d7043',
        },
      },
    },
  },
}
```

### 5. Add content

Create markdown files in `content/docs/`:

```markdown
---
title: Getting Started
description: Learn how to use our product
section: Getting Started
order: 1
---

# Getting Started

Welcome to our documentation!
```

## Customization

### Custom DocsPage

```tsx
import { DocsLayout, Markdown } from '@usecross/docs'

function MyDocsPage({ content }) {
  return (
    <DocsLayout
      title={content.title}
      logo={<MyLogo />}
      githubUrl="https://github.com/myorg/myproject"
      navLinks={[{ label: 'Docs', href: '/docs' }]}
    >
      <Markdown content={content.body} />
    </DocsLayout>
  )
}
```

### Custom components

```tsx
import { Sidebar, Markdown, CodeBlock } from '@usecross/docs'

function FullyCustomPage({ content }) {
  return (
    <div className="flex">
      <Sidebar nav={nav} currentPath={currentPath} />
      <main>
        <Markdown
          content={content.body}
          components={{
            code: (props) => <CodeBlock {...props} theme="github-light" />
          }}
        />
      </main>
    </div>
  )
}
```

## API Reference

### Python (`cross-docs`)

- `parse_frontmatter(content)` - Parse YAML frontmatter from markdown
- `load_markdown(content_dir, path)` - Load and parse a markdown file
- `load_raw_markdown(content_dir, path)` - Load raw markdown content
- `generate_nav(docs_dir, ...)` - Generate navigation from file structure
- `strip_trailing_slash_middleware` - Redirect trailing slashes
- `wants_markdown(request)` - Check if request wants markdown (for AI tools)
- `create_docs_handler(...)` - Create a docs route handler

### JavaScript (`@usecross/docs`)

**Components:**
- `DocsLayout` - Full documentation layout with sidebar
- `DocsPage` - Default docs page (layout + markdown)
- `Sidebar` - Navigation sidebar
- `Markdown` - Markdown renderer
- `CodeBlock` - Syntax-highlighted code block

**Utilities:**
- `createDocsApp(config)` - Create Inertia app
- `createDocsServer(config)` - Create SSR server
- `cn(...classes)` - Tailwind class merger
- `getHighlighter()` - Get Shiki highlighter

## License

MIT

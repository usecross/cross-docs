---
title: JavaScript API
description: JavaScript API reference for @usecross/docs
section: API Reference
order: 2
---

# JavaScript API

The `@usecross/docs` package provides React components and utilities for documentation frontends.

## createDocsApp

Create and mount an Inertia.js documentation app.

```tsx
import { createDocsApp, DocsPage } from '@usecross/docs'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
  title: (title) => `${title} - My Docs`,
})
```

### Config options

| Option | Type | Description |
|--------|------|-------------|
| `pages` | `Record<string, Component>` | Map of page names to components |
| `title` | `(title: string) => string` | Title formatter function |

## createDocsServer

Create an SSR server for documentation.

```tsx
import { createDocsServer, DocsPage } from '@usecross/docs/ssr'

createDocsServer({
  pages: {
    'docs/DocsPage': DocsPage,
  },
  title: (title) => `${title} - My Docs`,
})
```

## Components

### DocsPage

Default documentation page with layout and markdown rendering.

```tsx
import { DocsPage } from '@usecross/docs'

// Use directly or as base for customization
```

### DocsLayout

Full documentation layout with sidebar and header.

```tsx
import { DocsLayout } from '@usecross/docs'

function CustomPage({ content, nav, currentPath }) {
  return (
    <DocsLayout
      title={content.title}
      logo={<Logo />}
      githubUrl="https://github.com/org/repo"
      navLinks={[{ label: 'Docs', href: '/docs' }]}
    >
      {children}
    </DocsLayout>
  )
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title |
| `logo` | `ReactNode` | Logo component or element |
| `logoUrl` | `string` | URL for logo image |
| `githubUrl` | `string` | GitHub repository URL |
| `navLinks` | `NavLink[]` | Header navigation links |
| `children` | `ReactNode` | Page content |

### Sidebar

Navigation sidebar component.

```tsx
import { Sidebar } from '@usecross/docs'

<Sidebar nav={nav} currentPath={currentPath} />
```

### Markdown

Markdown renderer with syntax highlighting.

```tsx
import { Markdown } from '@usecross/docs'

<Markdown
  content={markdownString}
  components={{
    code: CustomCodeBlock,
  }}
/>
```

### CodeBlock

Syntax-highlighted code block.

```tsx
import { CodeBlock } from '@usecross/docs'

<CodeBlock
  code={codeString}
  language="typescript"
  theme="github-dark"
/>
```

## Utilities

### cn

Tailwind class name merger utility.

```tsx
import { cn } from '@usecross/docs'

<div className={cn('base-class', isActive && 'active-class')} />
```

### getHighlighter

Get the Shiki highlighter instance.

```tsx
import { getHighlighter } from '@usecross/docs'

const highlighter = await getHighlighter()
const html = highlighter.codeToHtml(code, { lang: 'typescript' })
```

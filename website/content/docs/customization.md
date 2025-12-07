---
title: Customization
description: Customize the look and feel of your documentation
section: Guide
order: 1
---

# Customization

Cross-Docs is designed to be fully customizable while providing sensible defaults.

## Custom DocsPage

You can create your own DocsPage component for full control:

```tsx
import { DocsLayout, Markdown } from '@usecross/docs'

function MyDocsPage({ content, nav, currentPath }) {
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

## Custom components

Use individual components for even more control:

```tsx
import { Sidebar, Markdown, CodeBlock } from '@usecross/docs'

function FullyCustomPage({ content, nav, currentPath }) {
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

## Theming

Customize colors by extending the Tailwind theme:

```javascript
// tailwind.config.js
module.exports = {
  presets: [docsPreset],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
      },
    },
  },
}
```

## Logo

Pass logo URLs when creating the docs router:

```python
docs_router = create_docs_router(
    content_dir,
    logo_url="/static/logo.svg",
    logo_inverted_url="/static/logo-white.svg",
)
```

Or use a React component in your custom DocsPage:

```tsx
<DocsLayout logo={<img src="/logo.svg" alt="Logo" />}>
```

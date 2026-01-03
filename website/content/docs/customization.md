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

Customize colors using Tailwind CSS v4's `@theme` block in your CSS:

```css
/* styles.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
@import '@usecross/docs/styles.css';
@source "../node_modules/@usecross/docs";

@theme {
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  --color-primary-700: #15803d;
  --color-primary-800: #166534;
  --color-primary-900: #14532d;
  --color-primary-950: #052e16;
}
```

You can also use `color-mix()` to generate shades from a single base color:

```css
@theme {
  --color-primary-50: color-mix(in srgb, #22c55e 10%, white);
  --color-primary-100: color-mix(in srgb, #22c55e 20%, white);
  --color-primary-500: #22c55e;
  --color-primary-600: color-mix(in srgb, #22c55e 90%, black);
  --color-primary-900: color-mix(in srgb, #22c55e 30%, black);
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

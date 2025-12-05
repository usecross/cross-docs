# Cross-Docs Implementation Plan

A documentation framework built on Cross-Inertia, providing a complete solution for Python-backed documentation sites with React frontends, SSR support, and Shiki syntax highlighting.

## Architecture Overview

```
cross-docs/
├── python/                    # Python package (PyPI: cross-docs)
│   └── cross_docs/
│       ├── __init__.py
│       ├── markdown.py        # Markdown parsing utilities
│       ├── navigation.py      # Navigation generation
│       ├── middleware.py      # FastAPI middleware
│       ├── routes.py          # Route factories
│       └── ssr.py             # SSR client
│
└── js/                        # JavaScript package (npm: @usecross/docs)
    └── src/
        ├── index.ts           # Main exports
        ├── components/
        │   ├── DocsLayout.tsx
        │   ├── Sidebar.tsx
        │   ├── Markdown.tsx
        │   ├── CodeBlock.tsx
        │   └── index.ts
        ├── lib/
        │   ├── shiki.ts
        │   └── utils.ts
        ├── app.tsx            # createDocsApp factory
        ├── ssr.tsx            # createDocsServer factory
        ├── types.ts           # TypeScript types
        └── tailwind.preset.js # Tailwind preset
```

## Package 1: Python (`cross-docs`)

### 1.1 Markdown Utilities (`markdown.py`)

```python
from pathlib import Path
from fastapi import HTTPException

def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown content."""
    ...

def load_markdown(content_dir: Path, path: str) -> dict:
    """Load and parse a markdown file, returns {title, description, body}."""
    ...

def load_raw_markdown(content_dir: Path, path: str) -> str:
    """Load raw markdown file content."""
    ...
```

### 1.2 Navigation (`navigation.py`)

```python
def generate_nav(
    docs_dir: Path,
    section_order: list[str] | None = None,
    index_page: str = "introduction",
) -> list[dict]:
    """Generate navigation structure from markdown files."""
    ...
```

### 1.3 Middleware (`middleware.py`)

```python
from fastapi import Request
from fastapi.responses import RedirectResponse

async def strip_trailing_slash_middleware(request: Request, call_next):
    """Redirect URLs with trailing slashes."""
    ...

def wants_markdown(request: Request) -> bool:
    """Check if request prefers markdown (for AI tools)."""
    ...
```

### 1.4 Route Factories (`routes.py`)

```python
from fastapi import FastAPI

def create_docs_routes(
    app: FastAPI,
    content_dir: Path,
    component: str = "docs/DocsPage",
    base_path: str = "/docs",
    index_page: str = "introduction",
    enable_markdown_response: bool = True,
) -> None:
    """Add documentation routes to a FastAPI app."""
    ...
```

### 1.5 SSR Client (`ssr.py`)

Re-export from cross-inertia or include the SSR client.

### 1.6 Main Exports (`__init__.py`)

```python
from cross_docs.markdown import parse_frontmatter, load_markdown, load_raw_markdown
from cross_docs.navigation import generate_nav
from cross_docs.middleware import strip_trailing_slash_middleware, wants_markdown
from cross_docs.routes import create_docs_routes

__all__ = [
    "parse_frontmatter",
    "load_markdown",
    "load_raw_markdown",
    "generate_nav",
    "strip_trailing_slash_middleware",
    "wants_markdown",
    "create_docs_routes",
]
```

---

## Package 2: JavaScript (`@usecross/docs`)

### 2.1 Components

#### DocsLayout
```tsx
interface DocsLayoutProps {
  children: ReactNode
  title: string
  description?: string
  logo?: ReactNode
  logoInverted?: ReactNode
  githubUrl?: string
  navLinks?: Array<{ label: string; href: string }>
  footer?: ReactNode
}

export function DocsLayout(props: DocsLayoutProps): JSX.Element
```

#### Sidebar
```tsx
interface SidebarProps {
  nav: NavSection[]
  currentPath: string
  className?: string
}

export function Sidebar(props: SidebarProps): JSX.Element
```

#### Markdown
```tsx
interface MarkdownProps {
  content: string
  components?: Partial<Components>  // Override markdown components
}

export function Markdown(props: MarkdownProps): JSX.Element
```

#### CodeBlock
```tsx
interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  theme?: string
}

export function CodeBlock(props: CodeBlockProps): JSX.Element
```

### 2.2 App Factories

#### createDocsApp
```tsx
interface DocsAppConfig {
  pages: Record<string, React.ComponentType<any>>
  title?: (pageTitle: string) => string
}

export function createDocsApp(config: DocsAppConfig): void
```

#### createDocsServer (SSR)
```tsx
export function createDocsServer(config: DocsAppConfig): void
```

### 2.3 Types (`types.ts`)

```typescript
export interface NavItem {
  title: string
  href: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface SharedProps {
  nav: NavSection[]
  currentPath: string
}

export interface DocContent {
  title: string
  description: string
  body: string
}
```

### 2.4 Tailwind Preset (`tailwind.preset.js`)

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { /* configurable */ },
        dark: { /* code block colors */ },
      },
      fontFamily: {
        // Defaults, can be overridden
      },
      typography: { /* prose styles */ },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### 2.5 Utilities

```typescript
// lib/utils.ts
export function cn(...inputs: ClassValue[]): string

// lib/shiki.ts
export function getHighlighter(): Promise<HighlighterCore>
export function configureHighlighter(options: {
  theme?: string
  langs?: string[]
}): void
```

---

## User Experience

### Minimal Setup Example

**Python (`main.py`):**
```python
from pathlib import Path
from fastapi import FastAPI
from cross_docs import create_docs_routes, strip_trailing_slash_middleware

app = FastAPI()

# Add trailing slash redirect
app.middleware("http")(strip_trailing_slash_middleware)

# Add docs routes
create_docs_routes(
    app,
    content_dir=Path("content"),
    base_path="/docs",
)
```

**JavaScript (`app.tsx`):**
```tsx
import { createDocsApp, DocsPage } from '@usecross/docs'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
})
```

**Tailwind (`tailwind.config.js`):**
```javascript
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
        primary: { /* your brand colors */ },
      },
    },
  },
}
```

### Custom Layout Example

```tsx
import { DocsLayout, Markdown, Sidebar } from '@usecross/docs'

function CustomDocsPage({ content }) {
  return (
    <DocsLayout
      title={content.title}
      logo={<MyLogo />}
      githubUrl="https://github.com/myorg/myproject"
      footer={<MyFooter />}
    >
      <Markdown content={content.body} />
    </DocsLayout>
  )
}
```

### Fully Custom Setup

```tsx
import { Sidebar, Markdown, CodeBlock, cn } from '@usecross/docs'
import { usePage } from '@inertiajs/react'

function MyDocsPage({ content }) {
  const { nav, currentPath } = usePage().props

  return (
    <div className="flex">
      <aside className="w-64">
        <Sidebar nav={nav} currentPath={currentPath} />
      </aside>
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

---

## Implementation Steps

### Phase 1: Python Package
1. [ ] Create package structure in `python/`
2. [ ] Extract and refactor markdown utilities
3. [ ] Extract navigation generation
4. [ ] Create middleware module
5. [ ] Create route factory
6. [ ] Add pyproject.toml with dependencies
7. [ ] Write tests
8. [ ] Add README

### Phase 2: JavaScript Package
1. [ ] Create package structure in `js/`
2. [ ] Extract and refactor components
3. [ ] Create app factories
4. [ ] Create Tailwind preset
5. [ ] Add TypeScript types and exports
6. [ ] Add package.json with dependencies
7. [ ] Configure build (tsup or similar)
8. [ ] Write tests
9. [ ] Add README

### Phase 3: Integration & Testing
1. [ ] Create example project using both packages
2. [ ] Test SSR works correctly
3. [ ] Test markdown response for AI tools
4. [ ] Document customization options

### Phase 4: Publishing
1. [ ] Publish `cross-docs` to PyPI
2. [ ] Publish `@usecross/docs` to npm
3. [ ] Update cross-inertia website to use packages

---

## Dependencies

### Python Package
```toml
[project]
dependencies = [
    "fastapi>=0.100.0",
    "cross-inertia>=0.10.0",
    "jinja2>=3.1.0",
]
```

### JavaScript Package
```json
{
  "dependencies": {
    "@inertiajs/react": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-markdown": "^10.0.0",
    "rehype-raw": "^7.0.0",
    "remark-gfm": "^4.0.0",
    "shiki": "^1.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "tailwindcss": "^3.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

---

## Open Questions

1. **Package naming**: `cross-docs` or `@usecross/docs` for Python? Just `cross-docs` on PyPI?

2. **Theming approach**: CSS variables vs Tailwind config? Both?

3. **SSR bundling**: Should the JS package include pre-built SSR entry, or let users configure?

4. **Search**: Should we include search functionality in v1? (Pagefind, Algolia, etc.)

5. **MDX support**: Should we support MDX in addition to Markdown?

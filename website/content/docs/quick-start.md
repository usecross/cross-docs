---
title: Quick Start
description: Get up and running with Cross-Docs in minutes
section: Getting Started
order: 3
---

# Quick Start

This guide will help you set up a documentation site with Cross-Docs.

## 1. Create your backend

Set up a FastAPI application with Cross-Docs:

```python
from pathlib import Path
from fastapi import FastAPI
from cross_docs import create_docs_router, strip_trailing_slash_middleware
from inertia.fastapi import InertiaMiddleware

app = FastAPI()
app.add_middleware(InertiaMiddleware)
app.middleware("http")(strip_trailing_slash_middleware)

# Add docs routes - that's it!
app.include_router(create_docs_router(Path("content")))
```

## 2. Create your frontend

Set up a React app with Inertia:

```tsx
// app.tsx
import { createDocsApp, DocsPage } from '@usecross/docs'
import '@usecross/docs/styles.css'
import './styles.css'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
  title: (title) => `${title} - My Docs`,
})
```

## 3. Configure Tailwind

Create a `tailwind.config.js`:

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
        primary: {
          500: '#22c55e',
          600: '#16a34a',
        },
      },
    },
  },
}
```

## 4. Add content

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

## 5. Run your app

Start both the backend and frontend:

```bash
# Terminal 1 - Backend
uvicorn app:app --reload

# Terminal 2 - Frontend
npm run dev
```

Visit `http://localhost:8000/docs` to see your documentation!

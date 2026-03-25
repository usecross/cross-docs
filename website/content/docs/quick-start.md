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
from cross_docs import CrossDocs

# Creates a fully configured FastAPI app with Inertia wired up
# Use docs_url to avoid conflict with cross-docs at /docs
docs = CrossDocs(title="My Docs", docs_url="/api/docs", redoc_url="/api/redoc")
app = docs.app
```

> **Note:** FastAPI's built-in Swagger UI defaults to `/docs`, which conflicts with cross-docs. Setting `docs_url="/api/docs"` moves it to `/api/docs` instead.

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

## 3. Configure Tailwind CSS

Cross-Docs uses Tailwind CSS v4 with CSS-based configuration. Create your main CSS file:

```css
/* styles.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');

@import '@usecross/docs/styles.css';

/* Scan the library for utility classes */
@source "../node_modules/@usecross/docs";
```

To customize the primary color, add a `@theme` block:

```css
@theme {
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  /* Add more shades as needed */
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

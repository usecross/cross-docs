---
title: Installation
description: How to install Cross-Docs in your project
section: Getting Started
order: 2
---

# Installation

Cross-Docs requires both Python and JavaScript packages to work together.

## Prerequisites

- Python 3.10+
- Node.js 18+ (or Bun)
- A FastAPI application

## Install packages

### Python

Using uv (recommended):

```bash
uv add cross-docs
```

Or with pip:

```bash
pip install cross-docs
```

### JavaScript

Using npm:

```bash
npm install @usecross/docs
```

Using bun:

```bash
bun add @usecross/docs
```

## Peer dependencies

The JavaScript package requires these peer dependencies:

```bash
npm install react react-dom tailwindcss @tailwindcss/typography
```

## Next steps

Once installed, follow the [Quick Start guide](/docs/quick-start) to set up your first docs site.

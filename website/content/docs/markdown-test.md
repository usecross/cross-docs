---
title: Markdown Test
description: Preview all markdown features
section: Guide
order: 99
---

# Markdown Test

This page showcases all the markdown features supported by Cross-Docs.

## Alerts

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

## Task Lists

- [x] Add task list support
- [x] Add emoji support
- [x] Add footnotes support
- [x] Add alerts support
- [ ] Write more documentation
- [ ] Add more examples

## Emoji

Here are some emoji examples:

- :rocket: Rocket
- :sparkles: Sparkles
- :bug: Bug
- :heart: Heart
- :warning: Warning
- :white_check_mark: Check mark
- :x: X mark
- :bulb: Light bulb
- :memo: Memo
- :zap: Zap

## Footnotes

Here's a sentence with a footnote[^1]. And here's another one[^2].

You can also use named footnotes for better readability[^note].

[^1]: This is the first footnote with more details.
[^2]: This is the second footnote.
[^note]: Named footnotes are great for longer references that you want to identify easily in your source.

## Code Blocks

```python title="example.py"
from cross_docs import CrossDocs

docs = CrossDocs(content_dir="content")
app.include_router(docs.router)
```

```typescript title="app.tsx" showLineNumbers
import { createDocsApp } from '@usecross/docs'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
})
```

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Task Lists | :white_check_mark: | Fully supported |
| Emoji | :white_check_mark: | GitHub-style codes |
| Footnotes | :white_check_mark: | With backlinks |
| Alerts | :white_check_mark: | 5 types available |

## Text Formatting

- **Bold text** using `**text**`
- *Italic text* using `*text*`
- ~~Strikethrough~~ using `~~text~~`
- `inline code` using backticks
- <sub>Subscript</sub> using `<sub>`
- <sup>Superscript</sup> using `<sup>`

## Links

- [Internal link](/docs/introduction)
- [External link](https://github.com/usecross/cross-docs)

## Blockquote

> This is a regular blockquote. It can contain **bold**, *italic*, and `code`.
>
> It can also span multiple paragraphs.

---
release type: minor
---

# Table of Contents Support

Adds a "On This Page" table of contents sidebar for documentation pages, similar to Tailwind's docs.

## Features

- Automatic TOC extraction from markdown H2 and H3 headings
- Scroll spy that highlights the current section as you scroll
- Smooth scroll navigation when clicking TOC items
- Proper handling of edge cases (bottom of page, URL hash on load)
- Right sidebar on xl+ screens (hidden on smaller viewports)

## New Components

- `TableOfContents` - Renders the TOC with scroll spy functionality

## Changes

- `markdown.py` - Added `slugify()` and `extract_toc()` functions
- `Markdown.tsx` - Heading components now generate matching anchor IDs
- `DocsLayout.tsx` - Added right sidebar for TOC display
- `DocsPage.tsx` - Passes TOC data to layout
- `types.ts` - Added `TOCItem` and `TableOfContentsProps` types

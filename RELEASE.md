---
release type: minor
---

# Add Custom React Components Support in Markdown

This release adds support for passing custom React components that can be embedded in markdown content. Users can now provide a `components` object in their `DocsAppConfig` to extend markdown rendering with custom components like alerts, cards, terminal examples, and more.

## New Features

- **Custom Components in Markdown**: Pass custom React components through `DocsAppConfig` that can be used directly in markdown files
- **ComponentsContext**: New context provider for managing custom components across the app
- **Automatic Tag Mapping**: Custom components are automatically mapped to lowercase HTML tag names to match standard HTML behavior

## Usage Example

```typescript
import { createDocsApp } from '@usecross/cross-docs'
import { Alert } from './components/Alert'
import { Card } from './components/Card'

createDocsApp({
  pages: import.meta.glob('./pages/**/*.tsx', { eager: true }),
  components: {
    Alert,
    Card,
  },
})
```

Then in your markdown:
```markdown
<alert type="warning">
This is a custom alert component!
</alert>
```

## Breaking Changes

None. This is a backward-compatible addition.

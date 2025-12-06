// Components
export {
  CodeBlock,
  DocsLayout,
  DocsPage,
  InlineCode,
  Markdown,
  Sidebar,
} from './components'

// App factory (client-side only)
export { createDocsApp } from './app'

// Utilities
export { cn } from './lib/utils'
export { getHighlighter, configureHighlighter } from './lib/shiki'

// Types
export type {
  CodeBlockProps,
  DocContent,
  DocsAppConfig,
  DocsLayoutProps,
  MarkdownProps,
  NavItem,
  NavSection,
  SharedProps,
  SidebarProps,
} from './types'

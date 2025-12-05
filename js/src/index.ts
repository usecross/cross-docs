// Components
export {
  CodeBlock,
  DocsLayout,
  DocsPage,
  InlineCode,
  Markdown,
  Sidebar,
} from './components'

// App factories
export { createDocsApp } from './app'
export { createDocsServer } from './ssr'

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

// Components
export {
  CodeBlock,
  DocsLayout,
  DocsPage,
  EmojiConfetti,
  HomePage,
  InlineCode,
  Markdown,
  Sidebar,
} from './components'

// HomePage sub-components (for compound component pattern)
export {
  HomeHeader,
  HomeHero,
  HomeFeatures,
  HomeFeatureItem,
  HomeCTA,
  HomeFooter,
} from './components/HomePage'

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

export type {
  HomePageProps,
  HomePageContextValue,
  HomeHeaderProps,
  HomeFeaturesProps,
  HomeFeatureItemProps,
  HomeFeature,
} from './components/HomePage'

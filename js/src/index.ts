// Components
export {
  CodeBlock,
  DocSetSelector,
  DocsLayout,
  DocsPage,
  EmojiConfetti,
  HomePage,
  InlineCode,
  Markdown,
  MobileMenuButton,
  Sidebar,
  TableOfContents,
  ThemeProvider,
  ThemeToggle,
  useTheme,
  themeInitScript,
  // API Documentation Components
  APIPage,
  APILayout,
  ModuleDoc,
  ClassDoc,
  FunctionDoc,
  Signature,
  Docstring,
  ParameterTable,
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
  DocSetMeta,
  MarkdownProps,
  NavItem,
  NavSection,
  SharedProps,
  SidebarProps,
  TableOfContentsProps,
  TOCItem,
  // API Documentation Types
  GriffeKind,
  GriffeDocstringSectionKind,
  GriffeExpression,
  GriffeParameter,
  GriffeDocstringElement,
  GriffeDocstringSection,
  GriffeDocstring,
  GriffeDecorator,
  GriffeObjectBase,
  GriffeFunction,
  GriffeAttribute,
  GriffeClass,
  GriffeModule,
  GriffeMember,
  APIPageProps,
  ModuleDocProps,
  ClassDocProps,
  FunctionDocProps,
  SignatureProps,
  DocstringProps,
  ParameterTableProps,
} from './types'

export type { Theme, ResolvedTheme } from './components/ThemeProvider'

export type {
  HomePageProps,
  HomePageContextValue,
  HomeHeaderProps,
  HomeFeaturesProps,
  HomeFeatureItemProps,
  HomeFeature,
} from './components/HomePage'

/**
 * Cross-Docs TypeScript type definitions
 */

import type { ReactNode } from 'react'

/** Single navigation item */
export interface NavItem {
  title: string
  href: string
}

/** Navigation section containing multiple items */
export interface NavSection {
  title: string
  items: NavItem[]
}

/** Documentation set metadata (for multi-docs mode) */
export interface DocSetMeta {
  name: string
  slug: string
  description: string
  /** Emoji or short text icon (e.g., "🍓") */
  icon?: string
  /** URL to icon image */
  iconUrl?: string
  prefix: string
}

/** Shared props passed to all pages via Inertia */
export interface SharedProps {
  nav: NavSection[]
  currentPath: string
  /** Logo image URL (from Python backend) */
  logoUrl?: string
  /** Logo image URL for dark/inverted contexts (from Python backend) */
  logoInvertedUrl?: string
  /** Footer logo image URL (from Python backend) */
  footerLogoUrl?: string
  /** Footer logo image URL for dark mode (from Python backend) */
  footerLogoInvertedUrl?: string
  /** GitHub repository URL (from Python backend) */
  githubUrl?: string
  /** Additional navigation links (from Python backend) */
  navLinks?: Array<{ label: string; href: string }>
  /** Available documentation sets (multi-docs mode) */
  docSets?: DocSetMeta[]
  /** Current documentation set slug (multi-docs mode) */
  currentDocSet?: string
}

/** Table of contents item */
export interface TOCItem {
  id: string
  /** Display text (use either text or title) */
  text?: string
  /** Display title (use either text or title) */
  title?: string
  level: number
}

/** Document content structure */
export interface DocContent {
  title: string
  description: string
  body: string
  toc?: TOCItem[]
}

/** Props for DocsLayout component */
export interface DocsLayoutProps {
  children: ReactNode
  title: string
  description?: string
  /** Custom logo component (React node) */
  logo?: ReactNode
  /** Custom logo for dark/inverted contexts (React node) */
  logoInverted?: ReactNode
  /** Logo image URL (alternative to logo prop, can be passed from backend) */
  logoUrl?: string
  /** Logo image URL for dark/inverted contexts */
  logoInvertedUrl?: string
  /** GitHub repository URL (shows GitHub icon in nav) */
  githubUrl?: string
  /** Additional navigation links */
  navLinks?: Array<{ label: string; href: string }>
  /** Custom header component (replaces entire header). Can be a ReactNode or a function that receives mobile menu props. */
  header?: ReactNode | ((props: { mobileMenuOpen: boolean; toggleMobileMenu: () => void }) => ReactNode)
  /** Header height in pixels. Used to calculate content offset. Defaults to 64 (h-16). */
  headerHeight?: number
  /** Custom footer component */
  footer?: ReactNode
  /** Table of contents items for the current page */
  toc?: TOCItem[]
}

/** Props for TableOfContents component */
export interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
  style?: React.CSSProperties
}

/** Props for Sidebar component */
export interface SidebarProps {
  nav: NavSection[]
  currentPath: string
  className?: string
  /** Available documentation sets (multi-docs mode) */
  docSets?: DocSetMeta[]
  /** Current documentation set slug (multi-docs mode) */
  currentDocSet?: string
}

/** Props for Markdown component */
export interface MarkdownProps {
  content: string
  /** Override default markdown components */
  components?: Record<string, React.ComponentType<any>>
}

/** Props for CodeBlock component */
export interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  theme?: string
  className?: string
}

/** Configuration for createDocsApp */
export interface DocsAppConfig {
  pages: Record<string, React.ComponentType<any>>
  title?: (pageTitle: string) => string
  /** Custom components to use in markdown (e.g., Alert, Card, etc.) */
  components?: Record<string, React.ComponentType<any>>
}

// =============================================================================
// Griffe API Documentation Types
// =============================================================================

/** Griffe object kinds */
export type GriffeKind = 'module' | 'class' | 'function' | 'attribute'

/** Griffe docstring section kinds */
export type GriffeDocstringSectionKind =
  | 'text'
  | 'parameters'
  | 'returns'
  | 'yields'
  | 'receives'
  | 'raises'
  | 'warns'
  | 'examples'
  | 'attributes'
  | 'other'
  | 'deprecated'
  | 'admonition'

/** Griffe expression (type annotation) */
export interface GriffeExpression {
  /** String representation of the expression */
  str?: string
  /** Canonical string representation */
  canonical?: string
  /** For name expressions */
  name?: string
  /** For subscript expressions (e.g., List[int]) */
  slice?: GriffeExpression
  /** For compound expressions */
  left?: GriffeExpression
  right?: GriffeExpression
}

/** Griffe parameter */
export interface GriffeParameter {
  name: string
  kind: 'positional-only' | 'positional-or-keyword' | 'var-positional' | 'keyword-only' | 'var-keyword'
  annotation?: GriffeExpression | string
  default?: string
}

/** Griffe docstring section element (for parameters, returns, etc.) */
export interface GriffeDocstringElement {
  name?: string
  annotation?: GriffeExpression | string
  description?: string
  value?: string
}

/** Griffe docstring section */
export interface GriffeDocstringSection {
  kind: GriffeDocstringSectionKind
  value?: string | GriffeDocstringElement[]
  title?: string
}

/** Griffe parsed docstring */
export interface GriffeDocstring {
  value: string
  parsed?: GriffeDocstringSection[]
}

/** Griffe decorator */
export interface GriffeDecorator {
  value: string
  lineno?: number
}

/** Base Griffe object with common properties */
export interface GriffeObjectBase {
  kind: GriffeKind
  name: string
  path?: string
  filepath?: string
  /** Relative file path (set by cross-docs) */
  relative_filepath?: string
  /** Relative file path within the package (set by Griffe) */
  relative_package_filepath?: string
  lineno?: number
  endlineno?: number
  docstring?: GriffeDocstring
  labels?: string[]
}

/** Griffe function/method */
export interface GriffeFunction extends GriffeObjectBase {
  kind: 'function'
  parameters?: GriffeParameter[]
  returns?: GriffeExpression | string
  decorators?: GriffeDecorator[]
  /** Whether this is an async function */
  is_async?: boolean
}

/** Griffe attribute */
export interface GriffeAttribute extends GriffeObjectBase {
  kind: 'attribute'
  annotation?: GriffeExpression | string
  value?: string
}

/** Griffe class */
export interface GriffeClass extends GriffeObjectBase {
  kind: 'class'
  bases?: Array<GriffeExpression | string>
  decorators?: GriffeDecorator[]
  members?: Record<string, GriffeMember>
}

/** Griffe module */
export interface GriffeModule extends GriffeObjectBase {
  kind: 'module'
  members?: Record<string, GriffeMember>
  /** Generator metadata added by cross-docs */
  _generator?: string
  _plugin?: string
  _version?: string
}

/** Griffe alias (re-export) */
export interface GriffeAlias {
  kind: 'alias'
  name: string
  path?: string
  /** The target path this alias points to */
  target_path: string
  lineno?: number
  endlineno?: number
}

/** Union of all Griffe member types */
export type GriffeMember = GriffeModule | GriffeClass | GriffeFunction | GriffeAttribute | GriffeAlias

/** Props for API documentation pages */
export interface APIPageProps {
  /** Full API data (the entire module tree) */
  apiData: GriffeModule
  /** Current item being viewed (module, class, or function) */
  currentItem?: GriffeMember
  /** Current URL path */
  currentPath: string
  /** Current module name */
  currentModule: string
  /** Navigation structure for API sidebar */
  apiNav: NavSection[]
  /** Logo URL */
  logoUrl?: string
  /** Logo URL for dark mode */
  logoInvertedUrl?: string
  /** Footer logo URL */
  footerLogoUrl?: string
  /** Footer logo URL for dark mode */
  footerLogoInvertedUrl?: string
  /** GitHub URL */
  githubUrl?: string
  /** Navigation links */
  navLinks?: Array<{ label: string; href: string }>
  /** Custom header component (replaces entire header). Can be a ReactNode or a function that receives mobile menu props. */
  header?: React.ReactNode | ((props: { mobileMenuOpen: boolean; toggleMobileMenu: () => void }) => React.ReactNode)
  /** Header height in pixels. Used to calculate content offset. Defaults to 64 (h-16). */
  headerHeight?: number
  /** Custom footer component */
  footer?: React.ReactNode
}

/** Props for ModuleDoc component */
export interface ModuleDocProps {
  module: GriffeModule
  /** URL prefix for links */
  prefix?: string
}

/** Props for ClassDoc component */
export interface ClassDocProps {
  cls: GriffeClass
  /** URL prefix for links */
  prefix?: string
}

/** Props for FunctionDoc component */
export interface FunctionDocProps {
  fn: GriffeFunction
  /** Whether this is a method (inside a class) */
  isMethod?: boolean
}

/** Props for Signature component */
export interface SignatureProps {
  fn: GriffeFunction
  /** Show full path or just name */
  showPath?: boolean
}

/** Props for Docstring component */
export interface DocstringProps {
  docstring: GriffeDocstring
  /** Show raw text instead of parsed sections */
  raw?: boolean
}

/** Props for ParameterTable component */
export interface ParameterTableProps {
  parameters: GriffeParameter[]
  /** Docstring sections for parameter descriptions */
  docstringSections?: GriffeDocstringSection[]
}

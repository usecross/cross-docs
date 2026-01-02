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
  /** GitHub repository URL (from Python backend) */
  githubUrl?: string
  /** Additional navigation links (from Python backend) */
  navLinks?: Array<{ label: string; href: string }>
}

/** Document content structure */
export interface DocContent {
  title: string
  description: string
  body: string
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
  /** Custom footer component */
  footer?: ReactNode
}

/** Props for Sidebar component */
export interface SidebarProps {
  nav: NavSection[]
  currentPath: string
  className?: string
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

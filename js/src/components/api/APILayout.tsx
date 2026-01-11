import { Head, Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { useTheme } from '../ThemeProvider'
import { MobileMenuButton } from '../DocsLayout'
import { Sidebar } from '../Sidebar'
import type { NavSection, SharedProps } from '../../types'

interface APILayoutProps {
  children: React.ReactNode
  title: string
  apiNav: NavSection[]
  currentPath: string
  logoUrl?: string
  logoInvertedUrl?: string
  footerLogoUrl?: string
  footerLogoInvertedUrl?: string
  githubUrl?: string
  navLinks?: Array<{ label: string; href: string }>
  /** Right sidebar content (e.g., table of contents) */
  rightSidebar?: React.ReactNode
  /** Custom header component (replaces entire header). Can be a ReactNode or a function that receives mobile menu props. */
  header?: React.ReactNode | ((props: { mobileMenuOpen: boolean; toggleMobileMenu: () => void }) => React.ReactNode)
  /** Header height in pixels. Used to calculate content offset. Defaults to 64 (h-16). */
  headerHeight?: number
  /** Custom footer component */
  footer?: React.ReactNode
}

/** Shared props type for API pages */
interface APISharedProps extends SharedProps {
  apiNav?: NavSection[]
}

function GitHubIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/**
 * Layout component for API documentation pages.
 * Uses the shared Sidebar component with compact styling and collapsible sections.
 */
export function APILayout({
  children,
  title,
  apiNav,
  currentPath,
  logoUrl: propLogoUrl,
  logoInvertedUrl: propLogoInvertedUrl,
  footerLogoUrl: propFooterLogoUrl,
  footerLogoInvertedUrl: propFooterLogoInvertedUrl,
  githubUrl: propGithubUrl,
  navLinks: propNavLinks,
  rightSidebar,
  header,
  headerHeight: propHeaderHeight = 64,
  footer,
}: APILayoutProps) {
  const sharedProps = usePage<{ props: APISharedProps }>().props as unknown as APISharedProps
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const headerHeight = propHeaderHeight

  // Merge props - component props take precedence over shared props from Python
  const logoUrl = propLogoUrl ?? sharedProps.logoUrl
  const logoInvertedUrl = propLogoInvertedUrl ?? sharedProps.logoInvertedUrl
  const githubUrl = propGithubUrl ?? sharedProps.githubUrl
  const navLinks = propNavLinks ?? sharedProps.navLinks ?? []

  const headerLogo = logoInvertedUrl ? (
    <img src={logoInvertedUrl} alt="Logo" className="h-8" />
  ) : logoUrl ? (
    <img src={logoUrl} alt="Logo" className="h-8" />
  ) : null

  const footerLogoUrl = propFooterLogoUrl || sharedProps.footerLogoUrl || logoUrl
  const footerLogoInvertedUrl = propFooterLogoInvertedUrl || sharedProps.footerLogoInvertedUrl || logoInvertedUrl
  const currentFooterLogoUrl = resolvedTheme === 'dark' ? (footerLogoInvertedUrl || footerLogoUrl) : footerLogoUrl
  const footerLogo = currentFooterLogoUrl ? (
    <img src={currentFooterLogoUrl} alt="Logo" className="h-6" />
  ) : null

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex flex-col transition-colors duration-200">
      <Head title={title} />

      {/* Fixed navigation */}
      {(typeof header === 'function'
        ? header({ mobileMenuOpen, toggleMobileMenu: () => setMobileMenuOpen(!mobileMenuOpen) })
        : header) || (
        <nav className="fixed w-full z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="px-4 lg:px-10">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} isOpen={mobileMenuOpen} />
                {headerLogo ? (
                  <Link href="/" className="flex items-center">
                    {headerLogo}
                  </Link>
                ) : (
                  <Link href="/" className="font-bold text-lg text-gray-900 dark:text-white">
                    Docs
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div className="-mr-2">
                  <ThemeToggle size="sm" />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hidden sm:block text-gray-700 dark:text-gray-300 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <GitHubIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="fixed inset-y-0 left-0 w-72 overflow-y-auto bg-white dark:bg-[#0f0f0f] px-4 py-6 border-r border-gray-200 dark:border-gray-800 transition-colors"
            style={{ paddingTop: headerHeight + 16 }}
          >
            <Sidebar
              nav={apiNav}
              currentPath={currentPath}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="bg-white dark:bg-[#0f0f0f] w-full flex-1 transition-colors" style={{ paddingTop: headerHeight }}>
        <div className="flex">
          {/* Desktop sidebar */}
          <aside
            className="hidden lg:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 transition-colors"
            style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
          >
            <div
              className="sticky px-6 py-6 overflow-y-auto"
              style={{ top: headerHeight, maxHeight: `calc(100vh - ${headerHeight}px)` }}
            >
              <Sidebar
                nav={apiNav}
                currentPath={currentPath}
              />
            </div>
          </aside>

          {/* Right section: content + TOC + footer */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 p-4 lg:px-10 lg:py-6">
              <div className="flex gap-5">
                {/* Main content */}
                <main className="min-w-0 w-full max-w-4xl">
                  {children}
                </main>

                {/* Table of Contents - desktop only */}
                {rightSidebar && (
                  <aside className="hidden xl:block w-56 shrink-0 transition-colors">
                    <div
                      className="sticky overflow-y-auto"
                      style={{ top: headerHeight + 24, maxHeight: `calc(100vh - ${headerHeight + 24}px)` }}
                    >
                      {rightSidebar}
                    </div>
                  </aside>
                )}
              </div>
            </div>

            {/* Footer */}
            {footer || (
              <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 lg:px-10 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  {footerLogo && <Link href="/">{footerLogo}</Link>}
                  <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-400">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="hover:text-black dark:hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    ))}
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black dark:hover:text-white transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

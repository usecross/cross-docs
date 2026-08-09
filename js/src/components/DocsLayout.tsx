import { Head, Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TableOfContents } from './TableOfContents'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './ThemeProvider'
import type { DocsLayoutProps, SharedProps } from '../types'

export function MobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center p-2 -ml-2 text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 lg:hidden transition-colors"
      aria-expanded={isOpen}
    >
      <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
      {isOpen ? (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  )
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
 * Full-featured documentation layout with sidebar, mobile menu, and header.
 */
export function DocsLayout({
  children,
  title,
  description: _description,
  logo,
  logoInverted,
  logoUrl: propLogoUrl,
  logoInvertedUrl: propLogoInvertedUrl,
  githubUrl: propGithubUrl,
  navLinks: propNavLinks,
  header,
  headerHeight = 64,
  footer,
  toc,
}: DocsLayoutProps) {
  const sharedProps = usePage<{ props: SharedProps }>().props as unknown as SharedProps
  const { nav, currentPath, docSets, currentDocSet } = sharedProps
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  // Merge props - component props take precedence over shared props from Python
  const logoUrl = propLogoUrl ?? sharedProps.logoUrl
  const logoInvertedUrl = propLogoInvertedUrl ?? sharedProps.logoInvertedUrl
  const githubUrl = propGithubUrl ?? sharedProps.githubUrl
  const navLinks = propNavLinks ?? sharedProps.navLinks ?? []

  // Determine which logo to display in header (prefer inverted/dark version)
  const headerLogo = logoInverted || logo || (logoInvertedUrl ? (
    <img src={logoInvertedUrl} alt="Logo" className="h-8" />
  ) : logoUrl ? (
    <img src={logoUrl} alt="Logo" className="h-8" />
  ) : null)

  // Determine which logo to display in footer (theme-aware)
  const footerLogoUrl = sharedProps.footerLogoUrl || logoUrl
  const footerLogoInvertedUrl = sharedProps.footerLogoInvertedUrl || logoInvertedUrl
  const currentFooterLogoUrl = resolvedTheme === 'dark' ? (footerLogoInvertedUrl || footerLogoUrl) : footerLogoUrl
  const footerLogo = logo || (currentFooterLogoUrl ? (
    <img src={currentFooterLogoUrl} alt="Logo" className="h-6" />
  ) : null)

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
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 w-72 overflow-y-auto bg-white dark:bg-[#0f0f0f] px-4 py-6 border-r border-gray-200 dark:border-gray-800 transition-colors"
            style={{ paddingTop: headerHeight + 16 }}
          >
            <Sidebar nav={nav} currentPath={currentPath} docSets={docSets} currentDocSet={currentDocSet} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="bg-white dark:bg-[#0f0f0f] w-full flex-1 transition-colors" style={{ paddingTop: headerHeight }}>
        <div className="flex">
          {/* Desktop sidebar - fixed width */}
          <aside
            className="hidden lg:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 transition-colors"
            style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
          >
            <nav
              className="sticky px-4 lg:px-10 py-6 overflow-y-auto"
              style={{ top: headerHeight, maxHeight: `calc(100vh - ${headerHeight}px)` }}
            >
              <Sidebar nav={nav} currentPath={currentPath} docSets={docSets} currentDocSet={currentDocSet} />
            </nav>
          </aside>

          {/* Right section: content + TOC + footer (not under left sidebar) */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 p-4 lg:px-10 lg:py-6">
              <div className="flex gap-5">
                {/* Main content */}
                <main className="min-w-0 w-full max-w-4xl">
                  <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-10 first:prose-h2:mt-0 prose-h3:text-xl prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none dark:prose-headings:text-white dark:prose-strong:text-white dark:text-gray-300">
                    {children}
                  </article>
                </main>

                {/* Table of Contents - desktop only */}
                {toc && toc.length > 0 && (
                  <aside className="hidden xl:block w-56 shrink-0 transition-colors">
                    <TableOfContents items={toc} className="sticky overflow-y-auto"
                      style={{ top: headerHeight + 24, maxHeight: `calc(100vh - ${headerHeight + 24}px)` }} />
                  </aside>
                )}
              </div>
            </div>

            {/* Footer - spans from after sidebar to right edge */}
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

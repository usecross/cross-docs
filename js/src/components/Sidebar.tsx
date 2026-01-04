import { Link } from '@inertiajs/react'
import { cn } from '../lib/utils'
import { DocSetSelector } from './DocSetSelector'
import type { SidebarProps } from '../types'

/**
 * Documentation sidebar with section-based navigation.
 * In multi-docs mode, includes a dropdown selector at the top.
 */
export function Sidebar({ nav, currentPath, className, docSets, currentDocSet }: SidebarProps) {
  return (
    <nav className={cn('space-y-6', className)}>
      {/* Doc Set Selector - only shown in multi-docs mode */}
      {docSets && docSets.length > 1 && (
        <DocSetSelector docSets={docSets} currentDocSet={currentDocSet ?? ''} className="mb-6" />
      )}

      {/* Navigation Sections */}
      <div className="space-y-8">
      {nav.map((section) => (
        <div key={section.title}>
          <h3 className="mb-3 text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {section.title}
          </h3>
          <ul className="space-y-1 border-l-2 border-gray-200 dark:border-gray-700">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block border-l-2 py-1.5 pl-4 text-sm transition-colors -ml-0.5',
                    currentPath === item.href
                      ? 'border-primary-500 text-gray-900 dark:text-white font-bold'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      </div>
    </nav>
  )
}

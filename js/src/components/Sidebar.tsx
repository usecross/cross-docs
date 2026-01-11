import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { cn } from '../lib/utils'
import { DocSetSelector } from './DocSetSelector'
import type { SidebarProps, NavSection } from '../types'

/**
 * Chevron icon for collapsible sections
 */
function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4 transition-transform duration-200', expanded && 'rotate-90', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Collapsible navigation section
 */
function CollapsibleSection({
  section,
  currentPath,
  defaultExpanded = true,
  compact = false,
}: {
  section: NavSection
  currentPath: string
  defaultExpanded?: boolean
  compact?: boolean
}) {
  // Check if current path is in this section
  const isActive = section.items.some(
    (item) => currentPath === item.href || currentPath + '/' === item.href
  )
  const [expanded, setExpanded] = useState(defaultExpanded || isActive)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-2 group"
      >
        <h3 className={cn(
          'text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400',
          'group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors'
        )}>
          {section.title}
        </h3>
        <ChevronIcon expanded={expanded} className="text-gray-400 dark:text-gray-500" />
      </button>
      {expanded && (
        <ul className={cn(
          'border-l-2 border-gray-200 dark:border-gray-700',
          compact ? 'space-y-0.5' : 'space-y-1.5'
        )}>
          {section.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block border-l-2 py-1 pl-4 leading-snug transition-colors -ml-0.5',
                  compact ? 'text-sm' : 'text-[15px]',
                  currentPath === item.href || currentPath + '/' === item.href
                    ? 'border-primary-500 text-gray-900 dark:text-white font-semibold'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Static navigation section (non-collapsible)
 */
function StaticSection({
  section,
  currentPath,
  compact = false,
}: {
  section: NavSection
  currentPath: string
  compact?: boolean
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {section.title}
      </h3>
      <ul className={cn(
        'border-l-2 border-gray-200 dark:border-gray-700',
        compact ? 'space-y-0.5' : 'space-y-1.5'
      )}>
        {section.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'block border-l-2 py-1 pl-4 leading-snug transition-colors -ml-0.5',
                compact ? 'text-sm' : 'text-[15px]',
                currentPath === item.href || currentPath + '/' === item.href
                  ? 'border-primary-500 text-gray-900 dark:text-white font-semibold'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface ExtendedSidebarProps extends SidebarProps {
  /** Use compact styling (smaller text) */
  compact?: boolean
  /** Make sections collapsible */
  collapsible?: boolean
  /** Collapse sections with more than N items by default */
  collapseThreshold?: number
}

/**
 * Documentation sidebar with section-based navigation.
 * Supports both docs and API navigation styles.
 */
export function Sidebar({
  nav,
  currentPath,
  className,
  docSets,
  currentDocSet,
  compact = false,
  collapsible = false,
  collapseThreshold = 10,
}: ExtendedSidebarProps) {
  return (
    <nav className={cn('space-y-6', className)}>
      {/* Doc Set Selector - only shown in multi-docs mode */}
      {docSets && docSets.length > 1 && (
        <DocSetSelector docSets={docSets} currentDocSet={currentDocSet ?? ''} className="mb-6" />
      )}

      {/* Navigation Sections */}
      <div className={compact ? 'space-y-4' : 'space-y-6'}>
        {nav.map((section) => {
          // Determine if this section should be collapsible
          const shouldCollapse = collapsible && section.items.length > collapseThreshold
          // Check if current path is in this section
          const isActive = section.items.some(
            (item) => currentPath === item.href || currentPath + '/' === item.href
          )

          if (shouldCollapse) {
            return (
              <CollapsibleSection
                key={section.title}
                section={section}
                currentPath={currentPath}
                defaultExpanded={isActive}
                compact={compact}
              />
            )
          }

          return (
            <StaticSection
              key={section.title}
              section={section}
              currentPath={currentPath}
              compact={compact}
            />
          )
        })}
      </div>
    </nav>
  )
}

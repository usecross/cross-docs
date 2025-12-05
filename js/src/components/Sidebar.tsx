import { Link } from '@inertiajs/react'
import { cn } from '../lib/utils'
import type { SidebarProps } from '../types'

/**
 * Documentation sidebar with section-based navigation.
 */
export function Sidebar({ nav, currentPath, className }: SidebarProps) {
  return (
    <nav className={cn('space-y-8', className)}>
      {nav.map((section) => (
        <div key={section.title}>
          <h3 className="mb-3 text-xs font-mono uppercase tracking-widest text-gray-500">
            {section.title}
          </h3>
          <ul className="space-y-1 border-l-2 border-gray-200">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'block border-l-2 py-1.5 pl-4 text-sm transition-colors -ml-0.5',
                    currentPath === item.href
                      ? 'border-primary-500 text-black font-bold'
                      : 'border-transparent text-gray-600 hover:border-black hover:text-black'
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

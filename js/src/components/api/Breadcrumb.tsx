import { Link } from '@inertiajs/react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb navigation for API documentation pages.
 * Shows the path: API > Module > Class
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav className={`flex items-center gap-2 text-sm mb-4 ${className}`}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronIcon className="text-gray-400 dark:text-gray-500" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Generate breadcrumb items from a path like "/api/strawberry/schema/schema/Schema"
 * Combines module path into dotted notation: API > strawberry.schema.schema > Schema
 */
export function generateBreadcrumb(currentPath: string, prefix: string = '/api'): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'API', href: prefix }]

  // Remove prefix from path
  const relativePath = currentPath.startsWith(prefix)
    ? currentPath.slice(prefix.length)
    : currentPath

  // Split path into parts
  const parts = relativePath.split('/').filter(Boolean)

  if (parts.length === 0) return items

  // If we have parts, combine all but the last into a module path
  if (parts.length === 1) {
    // Just one part - show it as the current item
    items.push({ label: parts[0] })
  } else {
    // Multiple parts: combine all but last into module path
    const moduleParts = parts.slice(0, -1)
    const finalItem = parts[parts.length - 1]

    // Build href for module path (link to the parent)
    const moduleHref = prefix + '/' + moduleParts.join('/')

    // Add module path as dotted notation
    items.push({
      label: moduleParts.join('.'),
      href: moduleHref,
    })

    // Add final item (class/function name)
    items.push({ label: finalItem })
  }

  return items
}

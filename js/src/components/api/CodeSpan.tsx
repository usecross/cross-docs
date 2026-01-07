import { cn } from '../../lib/utils'

interface CodeSpanProps {
  children: React.ReactNode
  /** Visual variant */
  variant?: 'default' | 'simple'
  /** Allow copy on click */
  allowCopy?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * Styled code span component matching strawberry.rocks design.
 * Uses coral/pink color for code badges.
 */
export function CodeSpan({ children, variant = 'default', allowCopy = false, className }: CodeSpanProps) {
  const handleCopy = () => {
    if (allowCopy && typeof children === 'string') {
      navigator.clipboard.writeText(children)
    }
  }

  if (variant === 'simple') {
    return (
      <code
        onClick={allowCopy ? handleCopy : undefined}
        className={cn(
          'font-mono text-[0.9em] font-semibold text-gray-900 dark:text-white',
          allowCopy && 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400',
          className
        )}
      >
        {children}
      </code>
    )
  }

  return (
    <code
      onClick={allowCopy ? handleCopy : undefined}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded font-mono text-sm',
        'bg-red-50 text-red-600 border border-red-200',
        'dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50',
        allowCopy && 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30',
        className
      )}
    >
      {children}
    </code>
  )
}

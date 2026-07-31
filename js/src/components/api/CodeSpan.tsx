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
  const isCopyable = allowCopy && typeof children === 'string'

  const handleCopy = () => {
    if (isCopyable) {
      navigator.clipboard.writeText(children)
    }
  }

  const codeClassName = cn(
    variant === 'simple'
      ? 'font-mono text-[0.9em] font-semibold text-gray-900 dark:text-white'
      : [
          'inline-flex items-center px-2 py-0.5 rounded font-mono text-sm',
          'bg-red-50 text-red-600 border border-red-200',
          'dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50',
        ],
    isCopyable && (
      variant === 'simple'
        ? 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400'
        : 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30'
    ),
    className
  )

  if (isCopyable) {
    return (
      <button
        type="button"
        title="Copy to clipboard"
        onClick={handleCopy}
        className={codeClassName}
      >
        {children}
      </button>
    )
  }

  return (
    <code className={codeClassName}>{children}</code>
  )
}

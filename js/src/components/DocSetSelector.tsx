import { useState, useRef, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { cn } from '../lib/utils'
import type { DocSetMeta } from '../types'

interface DocSetSelectorProps {
  docSets: DocSetMeta[]
  currentDocSet: string
  className?: string
}

// Elegant chevron with smooth animation
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Checkmark for selected state
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Default doc icon when no iconUrl is provided
const DocsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4.5A2.5 2.5 0 016.5 2H14a2 2 0 012 2v12a2 2 0 01-2 2H6.5A2.5 2.5 0 014 15.5v-11z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4 15.5A2.5 2.5 0 016.5 13H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 6h5M8 9h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * Dropdown selector for switching between documentation sets.
 * Displayed at the top of the sidebar in multi-docs mode.
 */
export function DocSetSelector({ docSets, currentDocSet, className }: DocSetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = docSets.find((ds) => ds.slug === currentDocSet) || docSets[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (docSet: DocSetMeta) => {
    setIsOpen(false)
    if (docSet.slug !== currentDocSet) {
      router.visit(`${docSet.prefix}/`)
    }
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group w-full flex items-center gap-3 px-3 py-3',
          'bg-gradient-to-b from-white to-gray-50/80',
          'dark:from-[#1a1a1a] dark:to-[#151515]',
          'border border-gray-200/80 dark:border-[#2a2a2a]',
          'rounded-xl',
          'shadow-sm shadow-gray-900/[0.03] dark:shadow-black/20',
          'hover:border-gray-300 dark:hover:border-[#3a3a3a]',
          'hover:shadow-md hover:shadow-gray-900/[0.06] dark:hover:shadow-black/30',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f0f0f]',
          isOpen && 'border-gray-300 dark:border-[#3a3a3a] shadow-md'
        )}
        aria-label="Select documentation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          'bg-gradient-to-br from-primary-50 to-primary-100/50',
          'dark:from-primary-500/15 dark:to-primary-600/10',
          'border border-primary-200/50 dark:border-primary-500/20',
          'transition-all duration-200',
          'group-hover:from-primary-100 group-hover:to-primary-100/60',
          'dark:group-hover:from-primary-500/20 dark:group-hover:to-primary-600/15'
        )}>
          {current.iconUrl ? (
            <img src={current.iconUrl} alt="" className="w-5 h-5" />
          ) : (
            <DocsIcon className="w-[18px] h-[18px] text-primary-600 dark:text-primary-400" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 text-left min-w-0">
          <div className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {current.name}
          </div>
          {current.description && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 leading-tight">
              {current.description}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className={cn(
          'flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center',
          'text-gray-400 dark:text-gray-500',
          'transition-all duration-200',
          'group-hover:text-gray-600 dark:group-hover:text-gray-300',
          'group-hover:bg-gray-100 dark:group-hover:bg-white/5'
        )}>
          <ChevronIcon
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-200 ease-out',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute left-0 right-0 mt-2',
          'py-1.5 px-1.5',
          'bg-white/95 dark:bg-[#1a1a1a]/95',
          'backdrop-blur-xl',
          'border border-gray-200/80 dark:border-[#2a2a2a]',
          'rounded-xl',
          'shadow-xl shadow-gray-900/10 dark:shadow-black/50',
          'z-50',
          'transition-all duration-200 ease-out origin-top',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.97] -translate-y-2 pointer-events-none'
        )}
        role="listbox"
        aria-label="Select documentation set"
      >
        {docSets.map((docSet, index) => {
          const isSelected = docSet.slug === currentDocSet

          return (
            <button
              key={docSet.slug || '_root'}
              onClick={() => handleSelect(docSet)}
              className={cn(
                'group/item w-full flex items-center gap-3 px-2.5 py-2.5',
                'rounded-lg',
                'transition-all duration-150 ease-out',
                'focus:outline-none',
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              )}
              role="option"
              aria-selected={isSelected}
              style={{
                animationDelay: isOpen ? `${index * 30}ms` : '0ms',
              }}
            >
              {/* Icon */}
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                'transition-all duration-150',
                isSelected
                  ? 'bg-primary-100 dark:bg-primary-500/20'
                  : 'bg-gray-100 dark:bg-white/5 group-hover/item:bg-gray-150 dark:group-hover/item:bg-white/10'
              )}>
                {docSet.iconUrl ? (
                  <img src={docSet.iconUrl} alt="" className="w-4.5 h-4.5" />
                ) : (
                  <DocsIcon className={cn(
                    'w-4 h-4 transition-colors duration-150',
                    isSelected
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover/item:text-gray-600 dark:group-hover/item:text-gray-300'
                  )} />
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left min-w-0">
                <div
                  className={cn(
                    'text-[13px] font-medium truncate leading-tight transition-colors duration-150',
                    isSelected
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white'
                  )}
                >
                  {docSet.name}
                </div>
                {docSet.description && (
                  <div className={cn(
                    'text-[11px] truncate mt-0.5 leading-tight transition-colors duration-150',
                    isSelected
                      ? 'text-primary-600/70 dark:text-primary-400/70'
                      : 'text-gray-500 dark:text-gray-500'
                  )}>
                    {docSet.description}
                  </div>
                )}
              </div>

              {/* Checkmark indicator */}
              <div className={cn(
                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                'transition-all duration-200',
                isSelected
                  ? 'bg-primary-500 dark:bg-primary-500 scale-100 opacity-100'
                  : 'bg-transparent scale-75 opacity-0'
              )}>
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

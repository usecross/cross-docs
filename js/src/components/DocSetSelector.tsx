import { useState, useRef, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { cn } from '../lib/utils'
import type { DocSetMeta } from '../types'

interface DocSetSelectorProps {
  docSets: DocSetMeta[]
  currentDocSet: string
  className?: string
}

// Chevron icon with up/down indicators like Fumadocs
const ChevronUpDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 6l3-3 3 3M5 10l3 3 3-3"
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

// Default package/docs icon when no iconUrl is provided
const PackageIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2L17 6v8l-7 4-7-4V6l7-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 10v8M10 10l7-4M10 10L3 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Dropdown selector for switching between documentation sets.
 * Inspired by Fumadocs design - clean and minimal.
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
      {/* Trigger Button - Clean, flat design like Fumadocs */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2',
          'bg-gray-100/80 dark:bg-white/5',
          'border border-gray-200 dark:border-white/10',
          'rounded-lg',
          'hover:bg-gray-200/80 dark:hover:bg-white/10',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
        )}
        aria-label="Select documentation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400">
          {current.iconUrl ? (
            <img src={current.iconUrl} alt="" className="w-5 h-5" />
          ) : (
            <PackageIcon className="w-5 h-5" />
          )}
        </div>

        {/* Text */}
        <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white truncate">
          {current.name}
        </span>

        {/* Chevron */}
        <ChevronUpDownIcon className="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute left-0 right-0 mt-1.5',
          'py-1',
          'bg-white dark:bg-[#1a1a1a]',
          'border border-gray-200 dark:border-white/10',
          'rounded-lg',
          'shadow-lg shadow-black/5 dark:shadow-black/30',
          'z-50',
          'transition-all duration-150 ease-out origin-top',
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
        role="listbox"
        aria-label="Select documentation set"
      >
        {docSets.map((docSet) => {
          const isSelected = docSet.slug === currentDocSet

          return (
            <button
              key={docSet.slug || '_root'}
              onClick={() => handleSelect(docSet)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2',
                'transition-colors duration-100',
                'focus:outline-none',
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              )}
              role="option"
              aria-selected={isSelected}
            >
              {/* Icon */}
              <div className={cn(
                'flex-shrink-0 w-5 h-5 flex items-center justify-center',
                isSelected
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {docSet.iconUrl ? (
                  <img src={docSet.iconUrl} alt="" className="w-5 h-5" />
                ) : (
                  <PackageIcon className="w-5 h-5" />
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left min-w-0">
                <div
                  className={cn(
                    'text-sm font-medium truncate',
                    isSelected
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {docSet.name}
                </div>
                {docSet.description && (
                  <div className={cn(
                    'text-xs truncate',
                    isSelected
                      ? 'text-primary-600/70 dark:text-primary-400/70'
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {docSet.description}
                  </div>
                )}
              </div>

              {/* Checkmark indicator */}
              {isSelected && (
                <CheckIcon className="flex-shrink-0 w-4 h-4 text-primary-600 dark:text-primary-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

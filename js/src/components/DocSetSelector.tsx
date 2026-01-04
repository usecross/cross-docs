import { useState, useRef, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { cn } from '../lib/utils'
import type { DocSetMeta } from '../types'

interface DocSetSelectorProps {
  docSets: DocSetMeta[]
  currentDocSet: string
  className?: string
}

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
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
          'w-full flex items-center gap-3 px-3 py-2.5',
          'bg-gray-50 dark:bg-[#171717]',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg',
          'hover:bg-gray-100 dark:hover:bg-[#1f1f1f]',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
        )}
        aria-label="Select documentation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {current.iconUrl && <img src={current.iconUrl} alt="" className="w-5 h-5 flex-shrink-0" />}
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {current.name}
          </div>
          {current.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {current.description}
            </div>
          )}
        </div>
        <ChevronIcon
          className={cn(
            'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute left-0 right-0 mt-2',
          'p-1',
          'bg-white dark:bg-[#171717]',
          'border border-gray-200 dark:border-[#262626]',
          'rounded-xl',
          'shadow-lg shadow-black/5 dark:shadow-black/40',
          'z-50',
          'transition-all duration-200 ease-out origin-top',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
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
                'w-full flex items-center gap-3 px-3 py-2.5',
                'rounded-lg',
                'transition-all duration-150 ease-out',
                'focus:outline-none',
                isSelected
                  ? 'bg-gray-100 dark:bg-[#262626]'
                  : 'hover:bg-gray-50 dark:hover:bg-[#1f1f1f]'
              )}
              role="option"
              aria-selected={isSelected}
              style={{
                animationDelay: isOpen ? `${index * 25}ms` : '0ms',
              }}
            >
              {docSet.iconUrl && (
                <img src={docSet.iconUrl} alt="" className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1 text-left min-w-0">
                <div
                  className={cn(
                    'text-sm font-medium truncate',
                    isSelected
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {docSet.name}
                </div>
                {docSet.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {docSet.description}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  'transition-all duration-200',
                  isSelected
                    ? 'bg-primary-500 scale-100 opacity-100'
                    : 'bg-transparent scale-0 opacity-0'
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

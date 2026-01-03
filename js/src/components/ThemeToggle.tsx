import { useState, useRef, useEffect } from 'react'
import { useTheme, type Theme } from './ThemeProvider'
import { cn } from '../lib/utils'

interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

// Refined sun icon with balanced proportions
const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 5V3M12 21v-2M5 12H3m18 0h-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// Refined moon icon - elegant crescent
const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Refined monitor icon - clean display shape
const MonitorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21h8m-4-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const themeOptions: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
]

/**
 * Theme toggle dropdown with Light, Dark, and System options.
 * Refined design with smooth animations and premium feel.
 */
export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const iconSizes = {
    sm: 'w-[18px] h-[18px]',
    md: 'w-5 h-5',
    lg: 'w-[22px] h-[22px]',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-full p-4',
          'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
          'hover:bg-gray-100 dark:hover:bg-white/10',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f0f0f]',
          iconSizes[size],
          className
        )}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Sun icon - visible in light mode */}
        <SunIcon
          className={cn(
            iconSizes[size],
            'absolute inset-0 m-auto transition-all duration-300 ease-out',
            resolvedTheme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-75 opacity-0'
          )}
        />

        {/* Moon icon - visible in dark mode */}
        <MoonIcon
          className={cn(
            iconSizes[size],
            'absolute inset-0 m-auto transition-all duration-300 ease-out',
            resolvedTheme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-75 opacity-0'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute right-0 mt-2 min-w-[140px]',
          'p-1',
          'bg-white dark:bg-[#171717]',
          'border border-gray-200 dark:border-[#262626]',
          'rounded-xl',
          'shadow-lg shadow-black/5 dark:shadow-black/40',
          'z-50',
          'transition-all duration-200 ease-out origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        )}
        role="listbox"
        aria-label="Select theme"
      >
        {themeOptions.map((option, index) => {
          const Icon = option.icon
          const isSelected = theme === option.value

          return (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2',
                'rounded-lg',
                'text-[13px] font-medium',
                'transition-all duration-150 ease-out',
                'focus:outline-none',
                isSelected
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-[#262626]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1f1f1f]'
              )}
              role="option"
              aria-selected={isSelected}
              style={{
                animationDelay: isOpen ? `${index * 25}ms` : '0ms'
              }}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                'transition-transform duration-150',
                isSelected ? 'scale-110' : 'scale-100'
              )} />
              <span className="flex-1 text-left">{option.label}</span>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                'transition-all duration-200',
                isSelected
                  ? 'bg-primary-500 scale-100 opacity-100'
                  : 'bg-transparent scale-0 opacity-0'
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

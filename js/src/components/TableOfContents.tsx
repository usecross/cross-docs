import { useEffect, useState, useRef } from 'react'
import type { TableOfContentsProps } from '../types'

/**
 * Table of contents component with scroll spy functionality.
 * Displays "ON THIS PAGE" sidebar with heading links.
 */
export function TableOfContents({ items, className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(() => {
    // Initialize with hash from URL if present
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.slice(1)
    }
    return ''
  })

  // Track if we're currently scrolling from a click
  const isClickScrolling = useRef(false)

  useEffect(() => {
    if (items.length === 0) return

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        setActiveId(hash)
      }
    }
    window.addEventListener('hashchange', handleHashChange)

    // Scroll-based detection - find the heading closest to top of viewport
    const handleScroll = () => {
      // Skip if we're in the middle of a click-initiated scroll
      if (isClickScrolling.current) return

      const headerOffset = 100
      let currentId = ''

      // Check if we're at the bottom of the page
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50

      if (isAtBottom) {
        // At bottom of page - find the last heading that's visible in viewport
        for (let i = items.length - 1; i >= 0; i--) {
          const element = document.getElementById(items[i].id)
          if (element) {
            const rect = element.getBoundingClientRect()
            // If this heading is visible in the viewport
            if (rect.top < clientHeight && rect.bottom > 0) {
              currentId = items[i].id
              break
            }
          }
        }
      } else {
        // Normal scroll detection
        for (const item of items) {
          const element = document.getElementById(item.id)
          if (element) {
            const rect = element.getBoundingClientRect()
            // If the heading is at or above the threshold, it's the current section
            if (rect.top <= headerOffset) {
              currentId = item.id
            } else {
              // Once we find a heading below the threshold, stop
              break
            }
          }
        }
      }

      // If no heading is above threshold, use the first one
      if (!currentId && items.length > 0) {
        currentId = items[0].id
      }

      if (currentId) {
        setActiveId(currentId)
      }
    }

    // Throttle scroll handler
    let ticking = false
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollListener, { passive: true })

    // Initial check (only if no hash in URL)
    if (!window.location.hash) {
      handleScroll()
    }

    return () => {
      window.removeEventListener('scroll', scrollListener)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      // Mark that we're click-scrolling to prevent scroll handler from overriding
      isClickScrolling.current = true
      setActiveId(id)

      const top = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })

      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`)

      // Re-enable scroll detection after scroll settles
      // Use requestAnimationFrame loop to wait for scroll to stabilize
      let lastScrollY = window.scrollY
      let stableCount = 0
      const checkScrollEnd = () => {
        if (window.scrollY === lastScrollY) {
          stableCount++
          if (stableCount >= 5) {
            // Scroll has been stable for ~5 frames, animation is done
            isClickScrolling.current = false
            return
          }
        } else {
          stableCount = 0
          lastScrollY = window.scrollY
        }
        requestAnimationFrame(checkScrollEnd)
      }
      requestAnimationFrame(checkScrollEnd)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <nav className={className}>
      <h5 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
        On this page
      </h5>
      <ul className="space-y-2.5 text-sm border-l border-gray-200 dark:border-gray-700">
        {items.map((item) => {
          const isActive = activeId === item.id
          const indent = item.level === 3 ? 'pl-6' : 'pl-4'

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block ${indent} -ml-px border-l transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

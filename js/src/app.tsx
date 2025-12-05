import { createInertiaApp } from '@inertiajs/react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import type { DocsAppConfig } from './types'

/**
 * Create and mount an Inertia.js documentation app.
 *
 * @example
 * ```tsx
 * import { createDocsApp, DocsPage } from '@usecross/docs'
 *
 * createDocsApp({
 *   pages: {
 *     'docs/DocsPage': DocsPage,
 *   },
 *   title: (title) => `${title} - My Docs`,
 * })
 * ```
 */
export function createDocsApp(config: DocsAppConfig): void {
  const { pages, title } = config

  // Disable scroll restoration on initial page load
  if (typeof window !== 'undefined') {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }

  createInertiaApp({
    title: title ?? ((pageTitle) => (pageTitle ? `${pageTitle}` : 'Documentation')),
    resolve: (name) => {
      const page = pages[name]
      if (!page) {
        throw new Error(`Page component "${name}" not found`)
      }
      return page
    },
    setup({ el, App, props }) {
      if (el.hasChildNodes()) {
        hydrateRoot(el, <App {...props} />)
      } else {
        createRoot(el).render(<App {...props} />)
      }
    },
  })
}

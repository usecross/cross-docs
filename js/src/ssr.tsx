import { createInertiaApp } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import ReactDOMServer from 'react-dom/server'
import type { DocsAppConfig } from './types'

/**
 * Create an SSR server for documentation.
 *
 * @example
 * ```tsx
 * import { createDocsServer, DocsPage } from '@usecross/docs'
 *
 * createDocsServer({
 *   pages: {
 *     'docs/DocsPage': DocsPage,
 *   },
 *   title: (title) => `${title} - My Docs`,
 * })
 * ```
 */
export function createDocsServer(config: DocsAppConfig): void {
  const { pages, title } = config

  createServer((page) =>
    createInertiaApp({
      page,
      render: ReactDOMServer.renderToString,
      title: title ?? ((pageTitle) => (pageTitle ? `${pageTitle}` : 'Documentation')),
      resolve: (name) => {
        const pageComponent = pages[name]
        if (!pageComponent) {
          throw new Error(`Page component "${name}" not found`)
        }
        return pageComponent
      },
      setup: ({ App, props }) => <App {...props} />,
    })
  )
}

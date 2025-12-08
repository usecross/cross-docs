import { createDocsServer } from '@usecross/docs/ssr'
import { DocsPage, HomePage } from '@usecross/docs'

createDocsServer({
  pages: {
    'docs/DocsPage': DocsPage,
    'HomePage': HomePage,
  },
  title: (title) => `${title} - Cross-Docs`,
})

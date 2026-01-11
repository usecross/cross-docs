import { createDocsServer } from '@usecross/docs/ssr'
import { DocsPage, HomePage } from '@usecross/docs'
import { CustomAPIPage } from './components'

createDocsServer({
  pages: {
    'docs/DocsPage': DocsPage,
    'HomePage': HomePage,
    'api/APIPage': CustomAPIPage,
  },
  title: (title) => `${title} - Cross-Docs`,
})

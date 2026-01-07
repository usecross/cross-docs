import { createDocsApp, DocsPage, HomePage } from '@usecross/docs'
import { CustomAPIPage } from './components'
import './styles.css'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
    'HomePage': HomePage,
    'api/APIPage': CustomAPIPage,
  },
  title: (title) => `${title} - Cross-Docs`,
})

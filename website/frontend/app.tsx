import { createDocsApp, DocsPage } from '@usecross/docs'
import './styles.css'

createDocsApp({
  pages: {
    'docs/DocsPage': DocsPage,
  },
  title: (title) => `${title} - Cross-Docs`,
})

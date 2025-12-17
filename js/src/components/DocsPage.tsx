import { DocsLayout } from './DocsLayout'
import { Markdown } from './Markdown'
import type { DocContent, DocsLayoutProps } from '../types'
import { useComponents } from '../context/ComponentsContext'

interface DocsPageProps extends Omit<DocsLayoutProps, 'children' | 'title'> {
  content: DocContent
}

/**
 * Default documentation page component.
 * Renders markdown content within the DocsLayout.
 */
export function DocsPage({ content, ...layoutProps }: DocsPageProps) {
  const { components } = useComponents()

  return (
    <DocsLayout title={content?.title ?? ''} description={content?.description} {...layoutProps}>
      <Markdown content={content?.body ?? ''} components={components} />
    </DocsLayout>
  )
}

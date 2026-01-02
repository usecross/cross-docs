import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from './CodeBlock'
import type { MarkdownProps } from '../types'

/**
 * Markdown renderer with syntax highlighting and GFM support.
 */
export function Markdown({ content, components }: MarkdownProps) {
  // Create lowercase mappings for custom components
  // HTML tag names are case-insensitive, so <TerminalExample> becomes <terminalexample>
  const lowercaseComponents = components
    ? Object.entries(components).reduce(
        (acc, [name, Component]) => {
          acc[name.toLowerCase()] = Component
          return acc
        },
        {} as Record<string, React.ComponentType<any>>
      )
    : {}

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        ...lowercaseComponents,
        // Override pre to avoid double wrapping with CodeBlock
        pre({ children }) {
          return <>{children}</>
        },
        // Custom code block rendering with syntax highlighting
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match && !className

          if (isInline) {
            return (
              <code
                className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                {...props}
              >
                {children}
              </code>
            )
          }

          // Parse meta string from the code fence (e.g., ```python title="app.py" showLineNumbers)
          const meta = (node?.data?.meta as string) || ''
          const titleMatch = /title="([^"]+)"/.exec(meta)
          const filename = titleMatch ? titleMatch[1] : undefined
          const showLineNumbers = meta.includes('showLineNumbers')

          return (
            <CodeBlock
              code={String(children).replace(/\n$/, '')}
              language={match ? match[1] : 'text'}
              filename={filename}
              showLineNumbers={showLineNumbers}
            />
          )
        },
        // Custom link styling
        a({ href, children }) {
          const isExternal = href?.startsWith('http')
          return (
            <a
              href={href}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {children}
            </a>
          )
        },
        // Tables
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border-b border-gray-200 bg-gray-50 px-4 py-2 font-semibold dark:border-gray-700 dark:bg-gray-800">
              {children}
            </th>
          )
        },
        td({ children }) {
          return (
            <td className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              {children}
            </td>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

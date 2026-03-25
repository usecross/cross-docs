import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkEmoji from 'remark-emoji'
import { remarkAlert } from 'remark-github-blockquote-alert'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from './CodeBlock'
import type { MarkdownProps } from '../types'

/**
 * Convert heading text to URL-safe slug.
 * Must match the Python slugify function in markdown.py.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Extract text content from React children.
 */
function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(getTextContent).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as React.ReactElement).props as { children?: React.ReactNode }
    return getTextContent(props.children)
  }
  return ''
}

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
      remarkPlugins={[remarkGfm, remarkEmoji, remarkAlert]}
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
        a({ href, children, node, ...props }) {
          const isExternal = href?.startsWith('http')
          return (
            <a
              href={href}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...props}
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
        // Headings with anchor IDs for TOC
        h2({ children }) {
          const text = getTextContent(children)
          const id = slugify(text)
          return (
            <h2 id={id}>
              {children}
            </h2>
          )
        },
        h3({ children }) {
          const text = getTextContent(children)
          const id = slugify(text)
          return (
            <h3 id={id}>
              {children}
            </h3>
          )
        },
        // Task list checkbox styling
        input({ type, checked, disabled, ...props }) {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                {...props}
              />
            )
          }
          return <input type={type} checked={checked} disabled={disabled} {...props} />
        },
        // Footnote section styling
        section({ className, children, ...props }) {
          if (className?.includes('footnotes')) {
            return (
              <section
                className="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
                {...props}
              >
                {children}
              </section>
            )
          }
          return <section className={className} {...props}>{children}</section>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

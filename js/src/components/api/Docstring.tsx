import type { GriffeDocstring, GriffeDocstringSection, GriffeDocstringElement, GriffeExpression } from '../../types'
import { Markdown } from '../Markdown'

/**
 * Render a type annotation expression to string
 */
function renderExpression(expr: GriffeExpression | string | undefined): string {
  if (!expr) return ''
  if (typeof expr === 'string') return expr
  if (expr.str) return expr.str
  if (expr.canonical) return expr.canonical

  const exprAny = expr as any

  // Handle ExprName with member reference
  if (expr.name && typeof expr.name === 'string') return expr.name

  // Handle ExprBoolOp (like `config or StrawberryConfig()`)
  if (exprAny.cls === 'ExprBoolOp' && exprAny.operator && Array.isArray(exprAny.values)) {
    return exprAny.values.map((v: any) => renderExpression(v)).join(` ${exprAny.operator} `)
  }

  // Handle ExprBinOp (like `type | None`)
  if (exprAny.cls === 'ExprBinOp' && exprAny.left && exprAny.right) {
    const left = renderExpression(exprAny.left)
    const right = renderExpression(exprAny.right)
    const op = exprAny.operator || '|'
    return `${left} ${op} ${right}`
  }

  // Handle ExprCall (like `StrawberryConfig()`)
  if (exprAny.cls === 'ExprCall' && exprAny.function) {
    const funcName = renderExpression(exprAny.function)
    const args = Array.isArray(exprAny.arguments)
      ? exprAny.arguments.map((a: any) => renderExpression(a)).join(', ')
      : ''
    return `${funcName}(${args})`
  }

  // Handle ExprAttribute (like contextlib.asynccontextmanager)
  if (exprAny.cls === 'ExprAttribute' && Array.isArray(exprAny.values)) {
    return exprAny.values.map((v: any) => renderExpression(v)).join('.')
  }

  // Handle ExprList and ExprTuple
  if ('elements' in exprAny && Array.isArray(exprAny.elements)) {
    const inner = exprAny.elements.map((el: any) => renderExpression(el)).join(', ')
    return exprAny.cls === 'ExprTuple' ? `(${inner})` : `[${inner}]`
  }

  // Handle ExprDict
  if (exprAny.cls === 'ExprDict' && Array.isArray(exprAny.keys) && Array.isArray(exprAny.values)) {
    const pairs = exprAny.keys.map((k: any, i: number) =>
      `${renderExpression(k)}: ${renderExpression(exprAny.values[i])}`
    ).join(', ')
    return `{${pairs}}`
  }

  // Handle ExprSubscript (like Dict[str, int])
  if (exprAny.left && exprAny.slice) {
    const left = renderExpression(exprAny.left)
    const slice = renderExpression(exprAny.slice)
    return `${left}[${slice}]`
  }

  // Handle slice expressions
  if ('slice' in exprAny && exprAny.slice && !exprAny.left) {
    return renderExpression(exprAny.slice)
  }

  // Fallback for unknown expressions
  if (typeof expr === 'object') {
    return JSON.stringify(expr)
  }

  return String(expr)
}

interface DocstringSectionProps {
  section: GriffeDocstringSection
}

function DocstringSection({ section }: DocstringSectionProps) {
  switch (section.kind) {
    case 'text':
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown content={section.value as string} />
        </div>
      )

    case 'parameters':
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Parameters</h4>
          <dl className="space-y-2">
            {(section.value as GriffeDocstringElement[])?.map((param) => (
              <div key={param.name} className="grid grid-cols-[auto_1fr] gap-x-3">
                <dt className="font-mono text-sm">
                  <span className="text-orange-600 dark:text-orange-400">{param.name}</span>
                  {param.annotation && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {' '}({renderExpression(param.annotation)})
                    </span>
                  )}
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">
                  {param.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )

    case 'returns':
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Returns</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {Array.isArray(section.value) ? (
              (section.value as GriffeDocstringElement[]).map((ret, i) => (
                <div key={i}>
                  {ret.annotation && (
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {renderExpression(ret.annotation)}
                    </span>
                  )}
                  {ret.description && <span> - {ret.description}</span>}
                </div>
              ))
            ) : (
              section.value
            )}
          </div>
        </div>
      )

    case 'raises':
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Raises</h4>
          <dl className="space-y-2">
            {(section.value as GriffeDocstringElement[])?.map((exc, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-x-3">
                <dt className="font-mono text-sm text-red-600 dark:text-red-400">
                  {exc.annotation ? renderExpression(exc.annotation) : exc.name}
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">
                  {exc.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )

    case 'examples':
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Examples</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{section.value as string}</code>
          </pre>
        </div>
      )

    case 'attributes':
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Attributes</h4>
          <dl className="space-y-2">
            {(section.value as GriffeDocstringElement[])?.map((attr) => (
              <div key={attr.name} className="grid grid-cols-[auto_1fr] gap-x-3">
                <dt className="font-mono text-sm">
                  <span className="text-orange-600 dark:text-orange-400">{attr.name}</span>
                  {attr.annotation && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {' '}({renderExpression(attr.annotation)})
                    </span>
                  )}
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-300">
                  {attr.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )

    case 'deprecated':
      return (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Deprecated</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{section.value as string}</p>
        </div>
      )

    case 'admonition':
      return (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          {section.title && (
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">{section.title}</h4>
          )}
          <p className="text-sm text-blue-700 dark:text-blue-300">{section.value as string}</p>
        </div>
      )

    default:
      if (section.title) {
        return (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h4>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {typeof section.value === 'string' ? section.value : JSON.stringify(section.value)}
            </div>
          </div>
        )
      }
      return null
  }
}

interface DocstringProps {
  docstring: GriffeDocstring | undefined
  /** Show raw text instead of parsed sections */
  raw?: boolean
  /** Only show the text/description part, skip parameters/returns/etc */
  showOnlyText?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * Renders a parsed docstring with sections for parameters, returns, raises, etc.
 */
export function Docstring({ docstring, raw = false, showOnlyText = false, className = '' }: DocstringProps) {
  if (!docstring) return null

  // If raw mode or no parsed sections, show raw value
  if (raw || !docstring.parsed || docstring.parsed.length === 0) {
    return (
      <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
        <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{docstring.value}</p>
      </div>
    )
  }

  // If showOnlyText, only render the first text section (the description)
  if (showOnlyText) {
    const firstTextSection = docstring.parsed.find(s => s.kind === 'text')
    if (!firstTextSection) return null

    return (
      <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
        <Markdown content={firstTextSection.value as string} />
      </div>
    )
  }

  return (
    <div className={className}>
      {docstring.parsed.map((section, i) => (
        <DocstringSection key={`${section.kind}-${i}`} section={section} />
      ))}
    </div>
  )
}

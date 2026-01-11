import { useState } from 'react'
import type { GriffeClass, GriffeFunction, GriffeAttribute, GriffeExpression } from '../../types'
import { Docstring } from './Docstring'
import { FunctionDoc } from './FunctionDoc'
import { CodeSpan } from './CodeSpan'

/**
 * Render a type annotation expression or value to string
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

  // Fallback for unknown expressions - try to avoid [object Object]
  if (typeof expr === 'object') {
    return JSON.stringify(expr)
  }

  return String(expr)
}

/**
 * Collapsible method item with arrow indicator (strawberry.rocks style)
 */
function CollapsibleMethod({ method }: { method: GriffeFunction }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-mono text-base font-semibold text-gray-900 dark:text-white">
          {method.name}
        </span>
        <span className="text-gray-400 text-sm">
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && (
        <div className="pb-6">
          <FunctionDoc fn={method} isMethod showName={false} />
        </div>
      )}
    </div>
  )
}

interface ClassDocProps {
  cls: GriffeClass
  /** URL prefix for links */
  prefix?: string
  /** Current path for breadcrumb */
  currentPath?: string
  /** GitHub repo URL for source links */
  githubUrl?: string
  /** Additional CSS class */
  className?: string
  /** Override display path (e.g., for aliases to show alias name instead of target path) */
  displayPath?: string
}

/**
 * Renders documentation for a class matching strawberry.rocks design.
 * Includes: Title, Constructor, Methods (collapsible), Attributes, and footer.
 */
export function ClassDoc({ cls, prefix: _prefix = '/api', currentPath: _currentPath, githubUrl, className = '', displayPath }: ClassDocProps) {
  const members = cls.members ?? {}

  // Separate members by type
  const methods: GriffeFunction[] = []
  const attributes: GriffeAttribute[] = []

  for (const member of Object.values(members)) {
    // Skip private members
    if (member.name.startsWith('_') && !member.name.startsWith('__')) continue

    if (member.kind === 'function') {
      methods.push(member as GriffeFunction)
    } else if (member.kind === 'attribute') {
      attributes.push(member as GriffeAttribute)
    }
  }

  // Sort methods: __init__ first, then public methods alphabetically, skip other dunders
  const initMethod = methods.find(m => m.name === '__init__')
  const publicMethods = methods
    .filter(m => m.name !== '__init__' && !m.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Sort attributes alphabetically, skip private ones
  const publicAttributes = attributes
    .filter(a => !a.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Get relative filepath for display (prefer package-relative path)
  const relativeFilepath = cls.relative_package_filepath || cls.relative_filepath || cls.filepath

  // Build GitHub URL for source link
  const githubSourceUrl = githubUrl && relativeFilepath && cls.lineno
    ? `${githubUrl}/blob/main/${relativeFilepath}#L${cls.lineno}-L${cls.endlineno || cls.lineno}`
    : undefined

  return (
    <div className={className}>
      {/* Title - monospace like strawberry.rocks */}
      <h1 className="font-mono text-2xl font-normal text-gray-900 dark:text-white mb-8">
        {displayPath || cls.path || cls.name}
      </h1>

      {/* Constructor section */}
      {initMethod && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Constructor:
          </h2>

          {/* Docstring description */}
          {initMethod.docstring && (
            <div className="mb-6">
              <Docstring docstring={initMethod.docstring} showOnlyText />
            </div>
          )}

          <FunctionDoc fn={initMethod} isMethod showName={false} />
        </section>
      )}

      {/* Class docstring if no __init__ */}
      {!initMethod && cls.docstring && (
        <section className="mb-8">
          <Docstring docstring={cls.docstring} />
        </section>
      )}

      {/* Methods section - collapsible */}
      {publicMethods.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Methods:
          </h2>
          <div>
            {publicMethods.map((method) => (
              <CollapsibleMethod key={method.name} method={method} />
            ))}
          </div>
        </section>
      )}

      {/* Attributes section */}
      {publicAttributes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Attributes:
          </h2>
          <div className="space-y-2">
            {publicAttributes.map((attr) => (
              <div key={attr.name} className="flex items-baseline gap-2">
                <CodeSpan>{attr.name}:</CodeSpan>
                {attr.annotation && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {renderExpression(attr.annotation)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer with file path and GitHub link */}
      {relativeFilepath && (
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <p className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              File path:
            </span>
            <CodeSpan allowCopy>{relativeFilepath}</CodeSpan>
          </p>
          {githubSourceUrl && (
            <p>
              <a
                href={githubSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 uppercase tracking-wide"
              >
                Open in GitHub
              </a>
            </p>
          )}
        </footer>
      )}
    </div>
  )
}

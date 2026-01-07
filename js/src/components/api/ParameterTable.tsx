import type { GriffeParameter, GriffeDocstringSection, GriffeDocstringElement, GriffeExpression } from '../../types'
import { CodeSpan } from './CodeSpan'

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

/**
 * Get parameter description from docstring sections
 */
function getParamDescription(
  paramName: string,
  docstringSections?: GriffeDocstringSection[]
): string | undefined {
  if (!docstringSections) return undefined

  for (const section of docstringSections) {
    if (section.kind === 'parameters' && Array.isArray(section.value)) {
      const param = (section.value as GriffeDocstringElement[]).find(
        (p) => p.name === paramName
      )
      if (param) return param.description
    }
  }
  return undefined
}

interface ParameterTableProps {
  parameters: GriffeParameter[]
  /** Docstring sections for parameter descriptions */
  docstringSections?: GriffeDocstringSection[]
  /** Additional CSS class */
  className?: string
}

/**
 * Renders a two-column parameter list matching strawberry.rocks design.
 * Left column: parameter name badge
 * Right column: description, type, and default value
 */
export function ParameterTable({ parameters, docstringSections, className = '' }: ParameterTableProps) {
  if (!parameters || parameters.length === 0) return null

  // Filter out 'self' parameter for cleaner display
  const displayParams = parameters.filter(p => p.name !== 'self')

  if (displayParams.length === 0) return null

  return (
    <ol className={`list-none p-0 ${className}`}>
      {displayParams.map((param, index) => {
        const description = getParamDescription(param.name, docstringSections)
        const annotation = renderExpression(param.annotation)
        const defaultValue = renderExpression(param.default)
        const isLast = index === displayParams.length - 1

        return (
          <li
            key={param.name}
            className="contents"
          >
            <div className={`grid grid-cols-[max-content_1fr] items-baseline gap-x-8 gap-y-2 py-6 ${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
              {/* Parameter name badge - left column */}
              <div className="flex-shrink-0">
                <CodeSpan>
                  {param.kind === 'var-positional' && '*'}
                  {param.kind === 'var-keyword' && '**'}
                  {param.name}:
                </CodeSpan>
              </div>

              {/* Description and metadata - right column */}
              <div className="space-y-3">
                {/* Description */}
                {description && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Type and Default in definition list style */}
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  {annotation && (
                    <>
                      <dt className="font-semibold text-gray-500 dark:text-gray-400">
                        Type
                      </dt>
                      <dd className="m-0">
                        <CodeSpan>{annotation}</CodeSpan>
                      </dd>
                    </>
                  )}

                  {defaultValue && (
                    <>
                      <dt className="font-semibold text-gray-500 dark:text-gray-400">
                        Default
                      </dt>
                      <dd className="m-0">
                        <CodeSpan>{defaultValue}</CodeSpan>
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

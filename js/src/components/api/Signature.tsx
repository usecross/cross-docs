import { useState } from 'react'
import type { GriffeFunction, GriffeParameter, GriffeExpression } from '../../types'

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
 * Render a parameter with its type annotation and default value
 */
function renderParameter(param: GriffeParameter): string {
  let result = ''

  // Handle special parameter kinds
  if (param.kind === 'var-positional') {
    result = `*${param.name}`
  } else if (param.kind === 'var-keyword') {
    result = `**${param.name}`
  } else {
    result = param.name
  }

  // Add type annotation
  if (param.annotation) {
    const annotation = renderExpression(param.annotation)
    if (annotation) {
      result += `: ${annotation}`
    }
  }

  // Add default value
  if (param.default) {
    result += ` = ${renderExpression(param.default)}`
  }

  return result
}

/**
 * Copy icon component
 */
function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

/**
 * Check icon component
 */
function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

interface SignatureProps {
  fn: GriffeFunction
  /** Show full path or just function name */
  showPath?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * Renders a Python function/method signature with syntax highlighting.
 * Uses dark background style matching strawberry.rocks.
 */
export function Signature({ fn, showPath = false, className = '' }: SignatureProps) {
  const [copied, setCopied] = useState(false)
  const name = showPath && fn.path ? fn.path : fn.name
  const isAsync = fn.is_async

  // Filter out 'self' for cleaner display
  const displayParams = fn.parameters?.filter(p => p.name !== 'self') ?? []

  // Render return type
  const returnType = renderExpression(fn.returns)

  // Build the plain text signature for copying
  const plainSignature = (() => {
    const params = displayParams.map(renderParameter).join(', ')
    const prefix = isAsync ? 'async def ' : 'def '
    return returnType
      ? `${prefix}${name}(${params}) -> ${returnType}`
      : `${prefix}${name}(${params})`
  })()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainSignature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Determine if we need multi-line formatting
  const needsMultiline = displayParams.length > 3

  return (
    <div className={`relative group ${className}`}>
      {/* Dark code block like strawberry.rocks */}
      <div className="font-mono text-sm bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
        <code className="text-gray-100">
          {isAsync && <span className="text-purple-400">async </span>}
          <span className="text-blue-400">def</span>
          {' '}
          <span className="text-yellow-300">{name}</span>
          <span className="text-gray-400">(</span>
          {displayParams.length > 0 && (
            needsMultiline ? (
              // Multi-line for many parameters
              <>
                {displayParams.map((param) => (
                  <span key={param.name} className="block pl-4">
                    {param.kind === 'var-positional' && <span className="text-gray-400">*</span>}
                    {param.kind === 'var-keyword' && <span className="text-gray-400">**</span>}
                    <span className="text-orange-300">{param.name}</span>
                    {param.annotation && (
                      <>
                        <span className="text-gray-400">: </span>
                        <span className="text-emerald-400">{renderExpression(param.annotation)}</span>
                      </>
                    )}
                    {param.default && (
                      <>
                        <span className="text-gray-400"> = </span>
                        <span className="text-blue-300">{renderExpression(param.default)}</span>
                      </>
                    )}
                    <span className="text-gray-400">,</span>
                  </span>
                ))}
              </>
            ) : (
              // Single line for few parameters
              displayParams.map((param, i) => (
                <span key={param.name}>
                  {i > 0 && <span className="text-gray-400">, </span>}
                  {param.kind === 'var-positional' && <span className="text-gray-400">*</span>}
                  {param.kind === 'var-keyword' && <span className="text-gray-400">**</span>}
                  <span className="text-orange-300">{param.name}</span>
                  {param.annotation && (
                    <>
                      <span className="text-gray-400">: </span>
                      <span className="text-emerald-400">{renderExpression(param.annotation)}</span>
                    </>
                  )}
                  {param.default && (
                    <>
                      <span className="text-gray-400"> = </span>
                      <span className="text-blue-300">{renderExpression(param.default)}</span>
                    </>
                  )}
                </span>
              ))
            )
          )}
          <span className="text-gray-400">)</span>
          {returnType && (
            <>
              <span className="text-gray-400"> -&gt; </span>
              <span className="text-emerald-400">{returnType}</span>
            </>
          )}
          <span className="text-gray-400">:</span>
          <span className="block pl-2 text-gray-500">...</span>
        </code>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded bg-gray-700 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-white"
        title="Copy to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  )
}

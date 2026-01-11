import { Link } from '@inertiajs/react'
import type { GriffeModule, GriffeClass, GriffeFunction, GriffeAttribute, GriffeMember, GriffeExpression } from '../../types'
import { Docstring } from './Docstring'
import { ClassDoc } from './ClassDoc'
import { FunctionDoc } from './FunctionDoc'

/**
 * Safely render a Griffe expression or value to a string
 */
function renderValue(value: string | GriffeExpression | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  // Handle Griffe expression objects
  if (value.str) return value.str
  if (value.canonical) return value.canonical

  const exprAny = value as any

  // Handle ExprName with member reference
  if (value.name && typeof value.name === 'string') return value.name

  // Handle ExprBoolOp (like `config or StrawberryConfig()`)
  if (exprAny.cls === 'ExprBoolOp' && exprAny.operator && Array.isArray(exprAny.values)) {
    return exprAny.values.map((v: any) => renderValue(v)).join(` ${exprAny.operator} `)
  }

  // Handle ExprBinOp (like `type | None`)
  if (exprAny.cls === 'ExprBinOp' && exprAny.left && exprAny.right) {
    const left = renderValue(exprAny.left)
    const right = renderValue(exprAny.right)
    const op = exprAny.operator || '|'
    return `${left} ${op} ${right}`
  }

  // Handle ExprCall (like `StrawberryConfig()`)
  if (exprAny.cls === 'ExprCall' && exprAny.function) {
    const funcName = renderValue(exprAny.function)
    const args = Array.isArray(exprAny.arguments)
      ? exprAny.arguments.map((a: any) => renderValue(a)).join(', ')
      : ''
    return `${funcName}(${args})`
  }

  // Handle ExprAttribute (like contextlib.asynccontextmanager)
  if (exprAny.cls === 'ExprAttribute' && Array.isArray(exprAny.values)) {
    return exprAny.values.map((v: any) => renderValue(v)).join('.')
  }

  // Handle ExprList and ExprTuple
  if ('elements' in exprAny && Array.isArray(exprAny.elements)) {
    const inner = exprAny.elements.map((el: any) => renderValue(el)).join(', ')
    return exprAny.cls === 'ExprTuple' ? `(${inner})` : `[${inner}]`
  }

  // Handle ExprDict
  if (exprAny.cls === 'ExprDict' && Array.isArray(exprAny.keys) && Array.isArray(exprAny.values)) {
    const pairs = exprAny.keys.map((k: any, i: number) =>
      `${renderValue(k)}: ${renderValue(exprAny.values[i])}`
    ).join(', ')
    return `{${pairs}}`
  }

  // Handle ExprSubscript (like Dict[str, int])
  if (exprAny.left && exprAny.slice) {
    const left = renderValue(exprAny.left)
    const slice = renderValue(exprAny.slice)
    return `${left}[${slice}]`
  }

  // Handle slice expressions
  if ('slice' in exprAny && exprAny.slice && !exprAny.left) {
    return renderValue(exprAny.slice)
  }

  // Fallback for unknown expressions
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

interface ModuleDocProps {
  module: GriffeModule
  /** URL prefix for links */
  prefix?: string
  /** Show full module content or just summary */
  showFull?: boolean
  /** Additional CSS class */
  className?: string
  /** Override display path (e.g., for aliases to show alias name instead of target path) */
  displayPath?: string
}

/**
 * Renders documentation for a module including its classes, functions, and submodules.
 */
export function ModuleDoc({ module, prefix = '/api', showFull = true, className = '', displayPath }: ModuleDocProps) {
  const members = module.members ?? {}

  // Separate members by type
  const submodules: GriffeModule[] = []
  const classes: GriffeClass[] = []
  const functions: GriffeFunction[] = []
  const attributes: GriffeAttribute[] = []

  for (const member of Object.values(members)) {
    switch (member.kind) {
      case 'module':
        submodules.push(member as GriffeModule)
        break
      case 'class':
        classes.push(member as GriffeClass)
        break
      case 'function':
        functions.push(member as GriffeFunction)
        break
      case 'attribute':
        attributes.push(member as GriffeAttribute)
        break
    }
  }

  // Sort alphabetically
  submodules.sort((a, b) => a.name.localeCompare(b.name))
  classes.sort((a, b) => a.name.localeCompare(b.name))
  functions.sort((a, b) => a.name.localeCompare(b.name))
  attributes.sort((a, b) => a.name.localeCompare(b.name))

  // Generate href for a member using dotted path
  const memberHref = (member: GriffeMember) => {
    const modulePath = module.path || module.name
    return `${prefix}/${modulePath}.${member.name}`
  }

  return (
    <div className={className}>
      {/* Module header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        <span className="text-gray-500 dark:text-gray-400 font-normal">module </span>
        {displayPath || module.path || module.name}
      </h1>

      {/* Docstring */}
      {module.docstring && (
        <div className="mb-8">
          <Docstring docstring={module.docstring} />
        </div>
      )}

      {/* Submodules */}
      {submodules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Submodules
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {submodules.map((submodule) => (
              <li key={submodule.name}>
                <Link
                  href={`${prefix}/${submodule.path || submodule.name}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="font-mono text-sm text-primary-600 dark:text-primary-400">
                    {submodule.path || submodule.name}
                  </div>
                  {submodule.docstring && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {submodule.docstring.value.split('\n')[0]}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Classes - summary or full */}
      {classes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Classes
          </h2>
          {showFull ? (
            <div className="space-y-12">
              {classes.map((cls) => (
                <ClassDoc key={cls.name} cls={cls} prefix={prefix} />
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {classes.map((cls) => (
                <li key={cls.name}>
                  <Link
                    href={memberHref(cls)}
                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <div className="font-mono text-sm text-primary-600 dark:text-primary-400">
                      {cls.name}
                    </div>
                    {cls.docstring && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {cls.docstring.value.split('\n')[0]}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Functions - summary or full */}
      {functions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Functions
          </h2>
          {showFull ? (
            <div className="space-y-8">
              {functions.map((fn) => (
                <FunctionDoc key={fn.name} fn={fn} />
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {functions.map((fn) => (
                <li key={fn.name}>
                  <Link
                    href={memberHref(fn)}
                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <div className="font-mono text-sm text-primary-600 dark:text-primary-400">
                      {fn.name}()
                    </div>
                    {fn.docstring && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {fn.docstring.value.split('\n')[0]}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Module-level attributes */}
      {attributes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Attributes
          </h2>
          <dl className="space-y-3">
            {attributes.map((attr) => (
              <div key={attr.name} id={attr.name} className="scroll-mt-20">
                <dt className="font-mono text-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">{attr.name}</span>
                  {attr.annotation && (
                    <>
                      <span className="text-gray-600 dark:text-gray-400">: </span>
                      <span className="text-green-600 dark:text-green-400">
                        {typeof attr.annotation === 'string' ? attr.annotation : attr.annotation.str || attr.annotation.name}
                      </span>
                    </>
                  )}
                  {attr.value && (
                    <>
                      <span className="text-gray-600 dark:text-gray-400"> = </span>
                      <span className="text-cyan-600 dark:text-cyan-400">{renderValue(attr.value)}</span>
                    </>
                  )}
                </dt>
                {attr.docstring && (
                  <dd className="mt-1 text-sm text-gray-600 dark:text-gray-300 ml-4">
                    {attr.docstring.value}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Source location */}
      {(module.relative_package_filepath || module.filepath) && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-mono">{module.relative_package_filepath || module.filepath}</span>
        </div>
      )}
    </div>
  )
}

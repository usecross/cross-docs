import type { GriffeFunction, GriffeDocstringElement } from '../../types'
import { Signature } from './Signature'
import { Docstring } from './Docstring'
import { ParameterTable } from './ParameterTable'
import { CodeSpan } from './CodeSpan'
import { Markdown } from '../Markdown'

interface FunctionDocProps {
  fn: GriffeFunction
  /** Whether this is a method (inside a class) */
  isMethod?: boolean
  /** Show function name as title */
  showName?: boolean
  /** GitHub repo URL for source links */
  githubUrl?: string
  /** Additional CSS class */
  className?: string
  /** Override display path (e.g., for aliases to show alias name instead of target path) */
  displayPath?: string
}

/**
 * Renders documentation for a function or method matching strawberry.rocks design.
 */
export function FunctionDoc({ fn, isMethod = false, showName = true, githubUrl, className = '', displayPath }: FunctionDocProps) {
  const hasParams = fn.parameters && fn.parameters.filter(p => p.name !== 'self').length > 0

  // Get returns description from docstring
  const returnsSection = fn.docstring?.parsed?.find(s => s.kind === 'returns')
  const returnsValue = returnsSection?.value
  const returnsDescription = Array.isArray(returnsValue)
    ? (returnsValue[0] as GriffeDocstringElement)?.description
    : undefined

  // Get additional text sections (examples, notes, etc.) - all text sections after the first
  const textSections = fn.docstring?.parsed?.filter(s => s.kind === 'text') || []
  const additionalTextSections = textSections.slice(1) // Skip first (description)

  // Get relative filepath for display (prefer package-relative path)
  const relativeFilepath = fn.relative_package_filepath || fn.relative_filepath || fn.filepath

  // Build GitHub URL for source link
  const githubSourceUrl = githubUrl && relativeFilepath && fn.lineno
    ? `${githubUrl}/blob/main/${relativeFilepath}#L${fn.lineno}-L${fn.endlineno || fn.lineno}`
    : undefined

  return (
    <article id={fn.name} className={`scroll-mt-20 ${className}`}>
      {/* Function name/title */}
      {showName && (
        <h1 className="font-mono text-2xl font-normal text-gray-900 dark:text-white mb-8">
          {displayPath || fn.path || fn.name}
        </h1>
      )}

      {/* Docstring - description text only */}
      {fn.docstring && (
        <div className="mb-6">
          <Docstring docstring={fn.docstring} showOnlyText />
        </div>
      )}

      {/* Returns section */}
      {returnsDescription && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Returns:
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {returnsDescription}
          </p>
        </section>
      )}

      {/* Signature section */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Signature:
        </h2>
        <Signature fn={fn} />
      </section>

      {/* Parameters section */}
      {hasParams && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Parameters:
          </h2>
          <ParameterTable
            parameters={fn.parameters!}
            docstringSections={fn.docstring?.parsed}
          />
        </section>
      )}

      {/* Additional text sections (examples, notes, etc.) */}
      {additionalTextSections.length > 0 && (
        <section className="mb-6 prose prose-sm dark:prose-invert max-w-none">
          {additionalTextSections.map((section, i) => (
            <Markdown key={i} content={section.value as string} />
          ))}
        </section>
      )}

      {/* Footer with file path and GitHub link (only for top-level functions) */}
      {!isMethod && relativeFilepath && (
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
    </article>
  )
}

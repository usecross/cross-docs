import type { APIPageProps, GriffeModule, GriffeClass, GriffeFunction, GriffeMember, GriffeAlias } from '../../types'
import { APILayout } from './APILayout'
import { ModuleDoc } from './ModuleDoc'
import { ClassDoc } from './ClassDoc'
import { FunctionDoc } from './FunctionDoc'
import { TableOfContents, generateClassToc, type TocItem } from './TableOfContents'

/**
 * Resolve an alias to its target in the API data
 */
function resolveAlias(alias: GriffeAlias, apiData: GriffeModule): GriffeMember | null {
  const targetPath = alias.target_path
  if (!targetPath) return null

  // Split the target path into parts
  const parts = targetPath.split('.')
  const packageName = apiData.name

  let current: GriffeModule | GriffeClass = apiData
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    // Skip the package name if it matches
    if (i === 0 && part === packageName) continue

    // Look in members
    if (current.members) {
      const member: GriffeMember | undefined = current.members[part]
      if (member) {
        // Only modules and classes have members to recurse into
        if (member.kind === 'module' || member.kind === 'class') {
          current = member as GriffeModule | GriffeClass
        } else {
          // Found a function, attribute, or alias - return it
          return member
        }
      } else {
        return null
      }
    } else {
      return null
    }
  }

  return current
}

/**
 * Generate TOC items based on item type
 */
function generateTocItems(item: GriffeMember, apiData: GriffeModule): TocItem[] {
  // Resolve aliases first
  if (item.kind === 'alias') {
    const resolved = resolveAlias(item as GriffeAlias, apiData)
    if (resolved) {
      return generateTocItems(resolved, apiData)
    }
    return []
  }

  if (item.kind === 'class') {
    return generateClassToc(item as GriffeClass)
  }
  if (item.kind === 'function') {
    const fn = item as GriffeFunction
    const items: TocItem[] = [{ id: fn.name, title: fn.name, level: 1 }]
    if (fn.parameters && fn.parameters.length > 0) {
      items.push({ id: 'parameters', title: 'Parameters', level: 2 })
    }
    return items
  }
  if (item.kind === 'module') {
    const mod = item as GriffeModule
    const items: TocItem[] = [{ id: mod.name, title: mod.name, level: 1 }]
    if (mod.members) {
      const members = Object.values(mod.members)
      const classes = members.filter(m => m.kind === 'class')
      const functions = members.filter(m => m.kind === 'function')

      if (classes.length > 0) {
        items.push({ id: 'classes', title: 'Classes', level: 2 })
      }
      if (functions.length > 0) {
        items.push({ id: 'functions', title: 'Functions', level: 2 })
      }
    }
    return items
  }
  return []
}

/**
 * Determine what kind of content to render based on the current item
 */
function APIContent({
  item,
  prefix,
  currentPath,
  apiData,
  displayPath,
}: {
  item: GriffeMember
  prefix: string
  currentPath: string
  apiData: GriffeModule
  /** Override the display path (used for aliases to show alias name instead of target) */
  displayPath?: string
}) {
  // Handle aliases by resolving to target
  if (item.kind === 'alias') {
    const alias = item as GriffeAlias
    const resolved = resolveAlias(alias, apiData)
    if (resolved) {
      // Pass the alias path as displayPath so title shows "strawberry.enum" not "strawberry.types.enum.enum"
      const aliasDisplayPath = alias.path || `${apiData.name}.${alias.name}`
      return <APIContent item={resolved} prefix={prefix} currentPath={currentPath} apiData={apiData} displayPath={aliasDisplayPath} />
    }
    // Could not resolve alias
    return (
      <div className="text-gray-600 dark:text-gray-300">
        <p>Could not resolve alias: {alias.target_path}</p>
      </div>
    )
  }

  switch (item.kind) {
    case 'module':
      return <ModuleDoc module={item as GriffeModule} prefix={prefix} showFull displayPath={displayPath} />

    case 'class':
      return <ClassDoc cls={item as GriffeClass} prefix={prefix} currentPath={currentPath} displayPath={displayPath} />

    case 'function':
      return <FunctionDoc fn={item as GriffeFunction} displayPath={displayPath} />

    default:
      return (
        <div className="text-gray-600 dark:text-gray-300">
          <p>Unknown item type: {item.kind}</p>
          <pre className="mt-4 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      )
  }
}

/**
 * Main API documentation page component.
 *
 * Renders API documentation with a separate sidebar navigation.
 * Automatically handles different item types (modules, classes, functions).
 *
 * @example
 * // In your pages configuration:
 * createDocsApp({
 *   pages: {
 *     'api/APIPage': APIPage,
 *     // ...
 *   }
 * })
 */
export function APIPage({
  apiData,
  currentItem,
  currentPath,
  currentModule,
  apiNav,
  prefix,
  logoUrl,
  logoInvertedUrl,
  footerLogoUrl,
  footerLogoInvertedUrl,
  githubUrl,
  navLinks,
  header,
  headerHeight,
  footer,
}: APIPageProps) {
  // Determine what to render
  const itemToRender = currentItem || apiData

  // Determine the title
  let title = 'API Reference'
  if (itemToRender) {
    const name = itemToRender.name || currentModule
    const kind = itemToRender.kind
    title = `${name} (${kind}) - API Reference`
  }

  // Generate table of contents
  const tocItems = itemToRender ? generateTocItems(itemToRender, apiData) : []

  return (
    <APILayout
      title={title}
      apiNav={apiNav}
      currentPath={currentPath}
      logoUrl={logoUrl}
      logoInvertedUrl={logoInvertedUrl}
      footerLogoUrl={footerLogoUrl}
      footerLogoInvertedUrl={footerLogoInvertedUrl}
      githubUrl={githubUrl}
      navLinks={navLinks}
      rightSidebar={tocItems.length > 0 ? <TableOfContents items={tocItems} /> : undefined}
      header={header}
      headerHeight={headerHeight}
      footer={footer}
    >
      <APIContent item={itemToRender} prefix={prefix} currentPath={currentPath} apiData={apiData} />
    </APILayout>
  )
}

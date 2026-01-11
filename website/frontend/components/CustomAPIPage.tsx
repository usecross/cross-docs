import { usePage } from '@inertiajs/react'
import {
  APILayout,
  ModuleDoc,
  ClassDoc,
  FunctionDoc,
  TableOfContents,
  type APIPageProps,
  type GriffeClass,
  type GriffeFunction,
  type GriffeModule,
  type TOCItem,
} from '@usecross/docs'
import { Header } from './Header'

/**
 * Generate TOC items from a class's members
 */
function generateClassToc(cls: GriffeClass): TOCItem[] {
  const items: TOCItem[] = []

  items.push({ id: cls.name, title: cls.name, level: 1 })

  if (!cls.members) return items

  const members = Object.values(cls.members)
  const methods = members.filter(m => m.kind === 'function')
  const attributes = members.filter(m => m.kind === 'attribute')

  const initMethod = methods.find(m => m.name === '__init__')
  if (initMethod) {
    items.push({ id: '__init__', title: '__init__', level: 2 })
  }

  if (methods.length > 0) {
    const otherMethods = methods.filter(m => m.name !== '__init__')
    otherMethods.sort((a, b) => a.name.localeCompare(b.name))

    for (const method of otherMethods) {
      items.push({ id: method.name, title: method.name, level: 2 })
    }
  }

  if (attributes.length > 0) {
    for (const attr of attributes) {
      items.push({ id: attr.name, title: attr.name, level: 2 })
    }
  }

  return items
}

export function CustomAPIPage() {
  const { apiData, currentItem, currentPath, apiNav } = usePage<{ props: APIPageProps }>().props as unknown as APIPageProps

  const item = currentItem || apiData
  const isClass = item?.kind === 'class'
  const isFunction = item?.kind === 'function'
  const isModule = item?.kind === 'module'

  const tocItems: TOCItem[] = isClass ? generateClassToc(item as GriffeClass) : []

  return (
    <APILayout
      title={item?.name || 'API Reference'}
      apiNav={apiNav}
      currentPath={currentPath}
      header={(props) => <Header {...props} />}
      rightSidebar={
        tocItems.length > 0 ? (
          <TableOfContents items={tocItems} style={{}} />
        ) : undefined
      }
    >
      {isModule && <ModuleDoc module={item as GriffeModule} />}
      {isClass && <ClassDoc cls={item as GriffeClass} />}
      {isFunction && <FunctionDoc fn={item as GriffeFunction} />}
    </APILayout>
  )
}

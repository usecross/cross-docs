// Re-export the shared TableOfContents component
export { TableOfContents } from '../TableOfContents'
export type { TOCItem as TocItem } from '../../types'

/**
 * Generate TOC items from a class's members
 * Filters out private members (except __init__) to match ClassDoc rendering
 */
export function generateClassToc(cls: {
  name: string
  members?: Record<string, { kind: string; name: string }>
}): { id: string; title: string; level: number }[] {
  const items: { id: string; title: string; level: number }[] = []

  // Add class name as top item
  items.push({ id: cls.name, title: cls.name, level: 1 })

  if (!cls.members) return items

  const members = Object.values(cls.members)

  // Filter methods: __init__ is special, skip other private/dunder methods
  const methods = members.filter(m => m.kind === 'function')
  const initMethod = methods.find(m => m.name === '__init__')
  const publicMethods = methods
    .filter(m => m.name !== '__init__' && !m.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter attributes: skip private ones
  const publicAttributes = members
    .filter(m => m.kind === 'attribute' && !m.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Add constructor section if exists
  if (initMethod) {
    items.push({ id: 'constructor', title: 'Constructor', level: 2 })
  }

  // Add methods section header if there are public methods
  if (publicMethods.length > 0) {
    items.push({ id: 'methods', title: 'Methods', level: 2 })
  }

  // Add attributes section header if there are public attributes
  if (publicAttributes.length > 0) {
    items.push({ id: 'attributes', title: 'Attributes', level: 2 })
  }

  return items
}

// Re-export the shared TableOfContents component
export { TableOfContents } from '../TableOfContents'
export type { TOCItem as TocItem } from '../../types'

/**
 * Generate TOC items from a class's members
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
  const methods = members.filter(m => m.kind === 'function')
  const attributes = members.filter(m => m.kind === 'attribute')

  // Find __init__ first
  const initMethod = methods.find(m => m.name === '__init__')
  if (initMethod) {
    items.push({ id: '__init__', title: '__init__', level: 2 })
  }

  // Add methods section
  if (methods.length > 0) {
    const otherMethods = methods.filter(m => m.name !== '__init__')
    otherMethods.sort((a, b) => a.name.localeCompare(b.name))

    for (const method of otherMethods) {
      items.push({ id: method.name, title: method.name, level: 2 })
    }
  }

  // Add attributes section
  if (attributes.length > 0) {
    for (const attr of attributes) {
      items.push({ id: attr.name, title: attr.name, level: 2 })
    }
  }

  return items
}

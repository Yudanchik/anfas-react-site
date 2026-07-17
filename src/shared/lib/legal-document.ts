export type LegalDocumentBlock =
  | {
      kind: 'paragraph'
      text: string
    }
  | {
      kind: 'list'
      items: string[]
    }

export type LegalDocumentSection = {
  title: string
  blocks: LegalDocumentBlock[]
}

const MAIN_SECTION_RE = /^\d+\.\s+/
const SUBSECTION_RE = /^\d+\.\d+\.\s+/
const LIST_ITEM_RE = /^—\s+/

export function parseLegalDocument(rawDocument: string): LegalDocumentSection[] {
  const sections: LegalDocumentSection[] = []
  const lines = rawDocument
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const currentSection = sections.at(-1)

    if (!currentSection && !MAIN_SECTION_RE.test(line)) {
      continue
    }

    if (MAIN_SECTION_RE.test(line) && !SUBSECTION_RE.test(line)) {
      sections.push({ title: line, blocks: [] })
      continue
    }

    if (!currentSection) {
      continue
    }

    if (LIST_ITEM_RE.test(line)) {
      const item = line.replace(LIST_ITEM_RE, '')
      const previousBlock = currentSection.blocks.at(-1)

      if (previousBlock?.kind === 'list') {
        previousBlock.items.push(item)
      } else {
        currentSection.blocks.push({ kind: 'list', items: [item] })
      }

      continue
    }

    currentSection.blocks.push({ kind: 'paragraph', text: line })
  }

  return sections
}

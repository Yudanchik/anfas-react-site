export type ProjectWorkBlock =
  | { kind: 'paragraph' | 'heading'; text: string }
  | { kind: 'work'; title: string; text: string }

/** Present the existing plain-text descriptions without accepting HTML from a CMS. */
export function projectWorkBlocks(details: readonly string[]): ProjectWorkBlock[] {
  return details.flatMap((paragraph) =>
    paragraph
      .split(/\s+[–—]\s+(?=[А-ЯЁA-Z][^:]{1,70}:)/u)
      .map((part): ProjectWorkBlock | null => {
        const text = part.trim()
        if (!text) return null
        if (text.endsWith(':')) return { kind: 'heading', text: text.slice(0, -1) }

        const work = text.match(/^(?:\d+\.\s*)?([^:]{2,80}):\s+(.+)$/u)
        return work
          ? { kind: 'work', title: work[1].trim(), text: work[2] }
          : { kind: 'paragraph', text }
      })
      .filter((block): block is ProjectWorkBlock => block !== null),
  )
}

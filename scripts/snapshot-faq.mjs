/**
 * Writes faq.snapshot.json from CMS seed.
 *   pnpm snapshot:faq
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'src/shared/content/faq')
const outPath = resolve(outDir, 'faq.snapshot.json')

function resolveCmsSeed() {
  if (process.env.ANFAS_CMS_ROOT?.trim()) {
    return resolve(process.env.ANFAS_CMS_ROOT.trim(), 'scripts/seed/faq-groups.json')
  }
  return resolve(root, '../anfas-cms/scripts/seed/faq-groups.json')
}

const seedPath = resolveCmsSeed()
if (!existsSync(seedPath)) {
  console.error(JSON.stringify({ error: `CMS seed missing: ${seedPath}` }))
  process.exit(1)
}

const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
const snapshot = [...seed]
  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  .map((group) => ({
    key: group.key,
    items: [...(group.items || [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
  }))

const totalItems = snapshot.reduce((sum, g) => sum + g.items.length, 0)
if (snapshot.length !== 2 || totalItems !== 11) {
  console.error(JSON.stringify({ error: `expected 2/11, got ${snapshot.length}/${totalItems}` }))
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(
  JSON.stringify(
    {
      outPath: 'src/shared/content/faq/faq.snapshot.json',
      groups: snapshot.length,
      totalItems,
      keys: snapshot.map((g) => g.key),
    },
    null,
    2,
  ),
)

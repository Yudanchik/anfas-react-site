/**
 * Writes projects.snapshot.json from CMS seed (portable paths) or regenerates
 * from frontend-shaped seed transform. Preferred input: anfas-cms seed.
 *
 *   pnpm snapshot:projects
 *   ANFAS_CMS_ROOT=../anfas-cms pnpm snapshot:projects
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'src/shared/content/projects')
const outPath = resolve(outDir, 'projects.snapshot.json')

function stripSlash(path) {
  return String(path).replace(/^\/+/, '')
}

function resolveCmsSeed() {
  if (process.env.ANFAS_CMS_ROOT?.trim()) {
    return resolve(process.env.ANFAS_CMS_ROOT.trim(), 'scripts/seed/projects.json')
  }
  return resolve(root, '../anfas-cms/scripts/seed/projects.json')
}

function fromCmsSeed(seedPath) {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  return seed.map((project) => {
    const item = {
      slug: project.slug,
      title: project.title,
      type: project.type,
      typeAccent: project.typeAccent,
      location: project.location,
      description: project.description,
      image: stripSlash(project.imagePath),
      area: project.area,
      term: project.term,
      price: project.price,
      size: project.size,
      gallery: [...project.gallery]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => stripSlash(item.imagePath)),
      details: [...project.details],
    }
    if (project.review) {
      item.review = { ...project.review }
    }
    return item
  })
}

const seedPath = resolveCmsSeed()
if (!existsSync(seedPath)) {
  console.error(
    JSON.stringify({
      error: `CMS seed missing: ${seedPath}`,
      hint: 'Set ANFAS_CMS_ROOT or keep ../anfas-cms next to this repo',
    }),
  )
  process.exit(1)
}

const snapshot = fromCmsSeed(seedPath)
if (snapshot.length !== 7) {
  console.error(JSON.stringify({ error: `expected 7 projects, got ${snapshot.length}` }))
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(
  JSON.stringify(
    {
      outPath: 'src/shared/content/projects/projects.snapshot.json',
      count: snapshot.length,
      slugs: snapshot.map((item) => item.slug),
      source: seedPath.includes('anfas-cms') ? 'cms-seed' : seedPath,
    },
    null,
    2,
  ),
)

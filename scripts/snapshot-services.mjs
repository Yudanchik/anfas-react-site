/**
 * Writes services.snapshot.json from CMS seed (portable paths).
 *
 *   pnpm snapshot:services
 *   ANFAS_CMS_ROOT=../anfas-cms pnpm snapshot:services
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, 'src/shared/content/services')
const outPath = resolve(outDir, 'services.snapshot.json')

function stripSlash(path) {
  return String(path).replace(/^\/+/, '')
}

function toFrontendMetric(stat) {
  return { value: stat.value, label: stat.label }
}

function resolveCmsSeed() {
  if (process.env.ANFAS_CMS_ROOT?.trim()) {
    return resolve(process.env.ANFAS_CMS_ROOT.trim(), 'scripts/seed/services.json')
  }
  return resolve(root, '../anfas-cms/scripts/seed/services.json')
}

function fromCmsSeed(seedPath) {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  return [...seed]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((service) => {
      const base = {
        id: service.serviceId,
        slug: service.slug,
        number: service.number,
        title: service.title,
        shortText: service.shortText,
        text: service.text,
        tags: [...service.tags],
        image: stripSlash(service.imagePath),
        imageWidth: service.imageWidth,
        imageHeight: service.imageHeight,
        lead: service.lead,
        hero: {
          eyebrow: service.hero.eyebrow,
          titleLine: service.hero.titleLine,
          titleAccent: service.hero.titleAccent,
          lead: service.hero.lead,
          stats: service.hero.stats.map((stat) => ({
            label: stat.label,
            value: stat.value,
          })),
          aside: { ...service.hero.aside },
        },
        bullets: [...service.bullets],
        metrics: service.metrics.map(toFrontendMetric),
        price: service.price,
        duration: service.duration,
        ctaLabel: service.ctaLabel,
        included: {
          label: service.included.label,
          titleMain: service.included.titleMain,
          titleAccent: service.included.titleAccent,
          lead: service.included.lead,
          groups: service.included.groups.map((group) => ({
            number: group.number,
            title: group.title,
            text: group.text,
            items: [...group.items],
          })),
          fit: {
            label: service.included.fit.label,
            title: service.included.fit.title,
            text: service.included.fit.text,
            points: [...service.included.fit.points],
          },
          note: service.included.note,
        },
        seo: {
          title: service.seo.title,
          description: service.seo.description,
          keywords: service.seo.keywords,
        },
      }

      if (service.serviceId === 'individual') {
        const story = service.storyIndividual
        return {
          ...base,
          story: {
            eyebrow: story.eyebrow,
            title: story.title,
            lead: story.lead,
            hero: {
              overline: story.hero.overline,
              title: story.hero.title,
              text: story.hero.text,
              metrics: story.hero.metrics.map(toFrontendMetric),
            },
            highlights: story.highlights.map((item) => ({ ...item })),
            steps: story.steps.map((item) => ({ ...item })),
          },
        }
      }

      const story = service.storyPackage
      return {
        ...base,
        story: {
          eyebrow: story.eyebrow,
          title: story.title,
          lead: story.lead,
          summary: {
            overline: story.summary.overline,
            title: story.summary.title,
            text: story.summary.text,
            bullets: [...story.summary.bullets],
          },
          steps: story.steps.map((item) => ({ ...item })),
        },
      }
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
if (snapshot.length !== 2) {
  console.error(JSON.stringify({ error: `expected 2 services, got ${snapshot.length}` }))
  process.exit(1)
}

for (const item of snapshot) {
  if (/localhost|127\.0\.0\.1/.test(item.image)) {
    console.error(JSON.stringify({ error: `localhost image forbidden: ${item.image}` }))
    process.exit(1)
  }
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(
  JSON.stringify(
    {
      outPath: 'src/shared/content/services/services.snapshot.json',
      count: snapshot.length,
      slugs: snapshot.map((item) => item.slug),
      source: seedPath.includes('anfas-cms') ? 'cms-seed' : seedPath,
    },
    null,
    2,
  ),
)

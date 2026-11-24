import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

async function load(entry, env = {}) {
  const bundle = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    define: { 'import.meta.env': JSON.stringify(env) },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
  )
}

test('published case is available in production while editorial controls stay disabled', async () => {
  const config = await load('src/shared/config/project-content-preview.ts', { DEV: false })
  assert.equal(config.hasDetailedProjectCase('2-murinskiy-37'), true)
  assert.equal(config.hasDetailedProjectCase('zhk-grafika'), false)
  assert.equal(config.hasGrafikaProjectCase('zhk-grafika'), true)
  assert.equal(config.canPreviewProjectContent(), false)
  assert.equal(config.isProjectContentPreview('?content-preview=1'), false)
})

test('editorial notes require the development flag and exact opt-in query', async () => {
  const config = await load('src/shared/config/project-content-preview.ts', {
    DEV: false,
    VITE_PROJECT_CONTENT_PREVIEW: 'true',
  })
  assert.equal(config.canPreviewProjectContent(), true)
  assert.equal(config.isProjectContentPreview(''), false)
  assert.equal(config.isProjectContentPreview('?content-preview=1'), true)
  assert.equal(config.isProjectContentPreview('?content-preview=0'), false)
  assert.equal(config.hasGrafikaProjectCase('zhk-grafika'), true)
  assert.equal(config.hasGrafikaProjectCase('verkhnekamenskaya'), false)
})

test('published Grafika case replaces the old mock review, price and term consistently', async () => {
  const { projectRepository } = await load('src/entities/project/api/index.ts', { DEV: false })
  const project = await projectRepository.getBySlug('zhk-grafika')
  assert.equal(project.term, '7 месяцев')
  assert.equal(project.price, '≈ 3,68 млн ₽')
  assert.equal(project.review, undefined)
  assert.equal(project.gallery.length, 39)
  assert.ok(project.details.some((text) => text.includes('Защита поверхностей')))
  assert.ok(project.details.every((text) => !/студи/iu.test(text)))
  assert.equal(
    (await projectRepository.getAll()).find((item) => item.slug === project.slug).price,
    project.price,
  )
  const data = await load('src/entities/project/model/grafika-case.data.ts')
  assert.equal(
    data.grafikaBudget.reduce((sum, row) => sum + row.amountRub, 0),
    3678451,
  )
  assert.equal(data.grafikaBudget.filter((row) => row.estimated).length, 2)
})

test('Grafika media and location describe the actual project without a mock rating', async () => {
  const seo = await load('src/entities/project/model/grafika-case.seo.ts')
  const work = seo.grafikaStructuredData['@graph'].find((item) => item['@type'] === 'CreativeWork')
  assert.equal(work.url, 'https://anfas-remont.ru/projects/zhk-grafika/')
  const { createSeoMeta } = await load('src/shared/config/seo.ts')
  const metadata = createSeoMeta({
    title: seo.grafikaCaseTitle,
    path: seo.grafikaCasePath,
    image: seo.grafikaShareImageUrl,
  })
  assert.equal(
    metadata.find((item) => item.property === 'og:image').content,
    'https://anfas-remont.ru/images/projects/zhk-grafika/share/grafika-1200x630.jpg',
  )

  assert.match(work.locationCreated.name, /Мурино/)
  assert.equal(work.associatedMedia.length, 49)
  assert.equal(new Set(work.associatedMedia.map((item) => item.contentUrl)).size, 49)
  assert.ok(
    work.associatedMedia.every((item) => item.caption.length > 20 && !/фото \d/.test(item.caption)),
  )
  assert.ok(!('review' in work) && !('aggregateRating' in work))
  const preview = await load('src/entities/project/model/grafika-case.seo.ts', {
    VITE_PROJECT_CONTENT_PREVIEW: 'true',
  })
  assert.equal(
    preview.grafikaShareImageUrl,
    'https://dev.anfas-remont.ru/images/projects/zhk-grafika/share/grafika-1200x630.jpg',
  )
})

test('public project list and case agree on the owner-confirmed approximate budget and work', async () => {
  const { projectRepository } = await load('src/entities/project/api/index.ts', { DEV: false })
  const project = await projectRepository.getBySlug('2-murinskiy-37')
  assert.equal(project.term, '8 месяцев')
  assert.match(project.price, /Около 5,85 млн ₽/)
  assert.equal(project.review, undefined)
  assert.equal(project.image, 'images/projects/2-murinskiy-37/finished/cover-0749.webp')
  assert.equal(project.gallery.length, 12)
  assert.ok(project.gallery.every((src) => src.includes('/finished/')))
  assert.ok(project.details.some((text) => text.includes('SoloLift')))
  assert.equal(
    (await projectRepository.getAll()).find((item) => item.slug === project.slug).price,
    project.price,
  )
  const data = await load('src/entities/project/model/murinskiy-case.data.ts')
  assert.equal(data.murinskiyBudgetTotalRub, 5852310)
  assert.equal(data.murinskiyBudget.filter((row) => row.estimated).length, 2)
})

test('case metadata links its canonical page, images and organization without a fabricated rating', async () => {
  const seo = await load('src/entities/project/model/murinskiy-case.seo.ts')
  assert.equal(seo.murinskiyCasePath, '/projects/2-murinskiy-37/')
  const work = seo.murinskiyCaseStructuredData['@graph'].find(
    (item) => item['@type'] === 'CreativeWork',
  )
  assert.equal(work.url, 'https://anfas-remont.ru/projects/2-murinskiy-37/')
  assert.equal(work.creator['@id'], 'https://anfas-remont.ru/#organization')
  assert.equal(work.associatedMedia.length, 35)
  assert.ok(
    work.associatedMedia.every(
      (item) =>
        item.contentUrl.startsWith('https://anfas-remont.ru/images/') && item.caption.length > 10,
    ),
  )
  assert.ok(!('review' in work) && !('aggregateRating' in work))
})

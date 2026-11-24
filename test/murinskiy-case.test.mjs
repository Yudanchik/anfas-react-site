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
})

test('public project list and case agree on the owner-confirmed approximate budget and work', async () => {
  const { projectRepository } = await load('src/entities/project/api/index.ts', { DEV: false })
  const project = await projectRepository.getBySlug('2-murinskiy-37')
  assert.equal(project.term, '8 месяцев')
  assert.match(project.price, /Около 5,85 млн ₽/)
  assert.equal(project.review, undefined)
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
  assert.equal(work.associatedMedia.length, 31)
  assert.ok(
    work.associatedMedia.every(
      (item) =>
        item.contentUrl.startsWith('https://anfas-remont.ru/images/') && item.caption.length > 10,
    ),
  )
  assert.ok(!('review' in work) && !('aggregateRating' in work))
})

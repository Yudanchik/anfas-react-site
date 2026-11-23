import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { build } from 'esbuild'

async function load(entry, env = {}) {
  const bundle = await build({
    entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', write: false,
    define: { 'import.meta.env': JSON.stringify(env) },
  })
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
}

const { projectWorkBlocks } = await load('src/entities/project/model/project-work-blocks.ts')

test('retains narrative and separates the existing numbered engineering work', () => {
  assert.deepEqual(projectWorkBlocks(['Объект после пожара.', 'Основные работы:', '5. Инженерные системы: Установлен SoloLift.']), [
    { kind: 'paragraph', text: 'Объект после пожара.' },
    { kind: 'heading', text: 'Основные работы' },
    { kind: 'work', title: 'Инженерные системы', text: 'Установлен SoloLift.' },
  ])
})

test('separates legacy combined work items without splitting ordinary dashes', () => {
  assert.deepEqual(projectWorkBlocks(['Пол: Кварцвинил — практичное покрытие. – Стены: Окраска.']), [
    { kind: 'work', title: 'Пол', text: 'Кварцвинил — практичное покрытие.' },
    { kind: 'work', title: 'Стены', text: 'Окраска.' },
  ])
})

test('empty descriptions do not create a work section or invent content', () => {
  assert.deepEqual(projectWorkBlocks(['', '  ']), [])
})

test('all seven existing projects provide nonempty work content', async () => {
  const { projects } = await load('src/entities/project/model/projects.data.ts')
  assert.equal(projects.length, 7)
  for (const project of projects) assert.ok(projectWorkBlocks(project.details).length > 0, project.slug)
})

test('normal production build ignores the editorial preview query', async () => {
  const { isProjectContentPreview } = await load('src/shared/config/project-content-preview.ts', { DEV: false })
  assert.equal(isProjectContentPreview('?content-preview=1'), false)
})

test('development preview is opt-in and does not accept other query values', async () => {
  const { isProjectContentPreview } = await load('src/shared/config/project-content-preview.ts', { DEV: false, VITE_PROJECT_CONTENT_PREVIEW: 'true' })
  assert.equal(isProjectContentPreview(''), false)
  assert.equal(isProjectContentPreview('?content-preview=0'), false)
  assert.equal(isProjectContentPreview('?content-preview=1'), true)
})

test('assembled Murinskiy case is isolated to dev and this one project', async () => {
  for (const env of [{ DEV: false }, { DEV: false, VITE_PROJECT_CONTENT_PREVIEW: 'false' }]) {
    const { isProjectCaseDraft } = await load('src/shared/config/project-content-preview.ts', env)
    assert.equal(isProjectCaseDraft('2-murinskiy-37'), false)
  }
  const { isProjectCaseDraft } = await load('src/shared/config/project-content-preview.ts', { DEV: false, VITE_PROJECT_CONTENT_PREVIEW: 'true' })
  assert.equal(isProjectCaseDraft('2-murinskiy-37'), true)
  assert.equal(isProjectCaseDraft('zhk-grafika'), false)
})

test('dev project list and case use the confirmed budget without changing production data', async () => {
  const production = await load('src/entities/project/api/index.ts', { DEV: false })
  const development = await load('src/entities/project/api/index.ts', { DEV: false, VITE_PROJECT_CONTENT_PREVIEW: 'true' })
  const productionProject = await production.projectRepository.getBySlug('2-murinskiy-37')
  const draft = await development.projectRepository.getBySlug('2-murinskiy-37')
  assert.equal(productionProject.price, '3\u00a0000\u00a0000 ₽')
  assert.equal(draft.term, '8 месяцев')
  assert.match(draft.price, /Около 5,85 млн ₽/)
  assert.equal(draft.review, undefined)
  const listed = (await development.projectRepository.getAll()).find(project => project.slug === draft.slug)
  assert.equal(listed.price, draft.price)
  const data = await load('src/entities/project/model/murinskiy-case.data.ts')
  assert.equal(data.murinskiyBudgetTotalRub, 5852310)
  assert.equal(data.murinskiyBudgetRecordedRub, 3432310)
  assert.equal(data.murinskiyBudget.filter(row => row.estimated).length, 2)
})

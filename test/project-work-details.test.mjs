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

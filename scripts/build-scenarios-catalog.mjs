/**
 * Dump scenario line titles/prices from *_price.mapping.ts into JSON,
 * then build docs/estimate-calculator/scenarios-catalog.md
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function parseMapping(relPath) {
  const src = readFileSync(path.join(root, relPath), 'utf8')
  const items = []
  // Object-literal mappings (floors/walls/ceilings/tile)
  const reObj =
    /\{\s*id:\s*'([^']+)'[\s\S]*?title:\s*'((?:\\'|[^'])*)'[\s\S]*?unit:\s*'([^']+)'[\s\S]*?unitPrice:\s*(\d+)/g
  let m
  while ((m = reObj.exec(src))) {
    items.push({
      id: m[1],
      title: m[2].replace(/\\'/g, "'"),
      unit: m[3],
      unitPrice: Number(m[4]),
    })
  }
  // Helper-call mappings (electrics/plumbing): pdf(...) / both(...)
  // Supports one-line and multiline: pdf('id', 'title', 'unit', price, ...)
  const reFn =
    /\b(?:pdf|both)\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'([^']+)'\s*,\s*(\d+)/g
  while ((m = reFn.exec(src))) {
    items.push({
      id: m[1],
      title: m[2].replace(/\\'/g, "'"),
      unit: m[3],
      unitPrice: Number(m[4]),
    })
  }
  if (items.length === 0) {
    console.warn('No items parsed from', relPath)
  }
  return Object.fromEntries(items.map((i) => [i.id, i]))
}

function line(map, id) {
  const i = map[id]
  if (!i) return { id, missing: true, title: `⚠ НЕТ В MAPPING: ${id}`, unit: '—', unitPrice: null }
  return i
}

function dump(map, keys) {
  return keys.map((k) => line(map, k))
}

const floors = parseMapping('src/entities/estimate/model/floors/floor-price.mapping.ts')
const walls = parseMapping('src/entities/estimate/model/walls/wall-price.mapping.ts')
const ceilings = parseMapping('src/entities/estimate/model/ceilings/ceiling-price.mapping.ts')
const tile = parseMapping('src/entities/estimate/model/tile/tile-price.mapping.ts')
const electric = parseMapping('src/entities/estimate/model/electrics/electric-price.mapping.ts')
const plumbing = parseMapping('src/entities/estimate/model/plumbing/plumbing-price.mapping.ts')

console.log('parsed counts', {
  floors: Object.keys(floors).length,
  walls: Object.keys(walls).length,
  ceilings: Object.keys(ceilings).length,
  tile: Object.keys(tile).length,
  electric: Object.keys(electric).length,
  plumbing: Object.keys(plumbing).length,
})

// --- Wall scenario key resolution (mirror of apply-wall-scenario.ts) ---
const DEMOLITION_KEYS = {
  wallpaper: 'demolition-wallpaper',
  paint: 'demolition-paint',
  plaster: 'demolition-plaster',
  'wall-tile': 'demolition-wall-tile',
  glassfiber: 'demolition-glassfiber',
}
const WALLPAPER_KEYS = {
  flizelin: 'wallpaper-flizelin',
  'vinyl-match': 'wallpaper-vinyl-match',
  photo: 'wallpaper-photo',
  'textile-match': 'wallpaper-textile-match',
}
const PAINT_KEYS = {
  'paint-1': 'paint-1',
  'paint-2': 'paint-2',
  'paint-3': 'paint-3',
  'paint-mech-2': 'paint-mech-2',
}
const WALL_STATE_LABELS = {
  'from-scratch': 'Стены с нуля',
  'after-demolition': 'После демонтажа',
  prefinish: 'Предчистовая',
  'demolition-only': 'Только демонтаж',
  'local-leveling': 'Локальное выравнивание',
  'finish-only': 'Только финиш',
}
const FINISH_LABELS = { none: 'без финиша', wallpaper: 'под обои', paint: 'под покраску' }

function resolveWallScenarioKeys(application) {
  const { state, finishTarget } = application
  const keys = []
  switch (state) {
    case 'demolition-only':
      keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper'])
      break
    case 'local-leveling':
      keys.push('plaster-local-fix', 'putty-local-3mm')
      break
    case 'finish-only':
      break
    case 'from-scratch':
      if (application.demolitionBeforeWork) {
        keys.push(DEMOLITION_KEYS[application.demolitionCovering ?? 'wallpaper'], 'prep-dust-removal')
      }
      keys.push(
        'primer-deep-penetration',
        'plaster-gypsum-beacons',
        'plaster-gypsum-main',
        'putty-base-2',
        'putty-sanding',
      )
      break
    case 'after-demolition':
      keys.push(
        'prep-dust-removal',
        'primer-deep-penetration',
        'plaster-gypsum-beacons',
        'plaster-gypsum-main',
        'putty-base-2',
        'putty-sanding',
      )
      break
    case 'prefinish':
      keys.push('prep-dust-removal', 'primer-one-layer', 'putty-base-2', 'putty-sanding')
      if (finishTarget === 'wallpaper') keys.push('prep-sand-plaster')
      if (finishTarget === 'paint') {
        keys.push('putty-finish-1', 'reinforce-glassfiber', 'putty-finish-sanding')
      }
      break
  }
  if (finishTarget === 'wallpaper' && state !== 'demolition-only' && state !== 'local-leveling') {
    keys.push(WALLPAPER_KEYS[application.wallpaperType ?? 'flizelin'])
  }
  if (finishTarget === 'paint' && state !== 'demolition-only' && state !== 'local-leveling') {
    if (state === 'from-scratch' || state === 'after-demolition') {
      keys.push('putty-finish-1', 'reinforce-glassfiber', 'putty-finish-sanding')
    }
    keys.push(PAINT_KEYS[application.paintLayers ?? 'paint-2'])
  }
  return [...new Set(keys)]
}

function formatWallScenarioLabel(application) {
  const { state, finishTarget } = application
  if (state === 'demolition-only') {
    const cover = {
      wallpaper: 'обои',
      paint: 'краска',
      plaster: 'штукатурка',
      'wall-tile': 'плитка',
      glassfiber: 'стеклохолст',
    }
    return `Только демонтаж (${cover[application.demolitionCovering] ?? application.demolitionCovering})`
  }
  if (state === 'local-leveling') return WALL_STATE_LABELS[state]
  if (state === 'finish-only') {
    if (finishTarget === 'wallpaper') return 'Только финиш: обои'
    if (finishTarget === 'paint') return 'Только финиш: покраска'
    return WALL_STATE_LABELS[state]
  }
  const base = application.demolitionBeforeWork && state === 'from-scratch'
    ? 'Демонтаж и стены с нуля'
    : WALL_STATE_LABELS[state]
  if (finishTarget === 'none') return `${base} (${FINISH_LABELS.none})`
  return `${base} ${FINISH_LABELS[finishTarget]}`
}

// --- Ceiling ---
const CEILING_DEMOLITION = {
  paint: 'demolition-paint',
  plaster: 'demolition-plaster',
  putty: 'demolition-putty',
  wallpaper: 'demolition-wallpaper',
  'gkl-frame': 'demolition-gkl-frame',
  suspended: 'demolition-suspended',
  stretch: 'demolition-stretch',
  'stretch-no-save': 'demolition-stretch-no-save',
  panel: 'demolition-panel',
}
const CEILING_PAINT = {
  'paint-ceiling-1': 'paint-ceiling-1',
  'paint-ceiling-2': 'paint-ceiling-2',
  'paint-ceiling-3': 'paint-ceiling-3',
  'paint-ceiling-mech-2': 'paint-ceiling-mech-2',
}
const PAINT_FINISH_CHAIN = [
  'putty-finish-ceiling-1',
  'reinforce-glassfiber-ceiling',
  'putty-finish-sanding-ceiling',
]
const PREP_PLASTER_CHAIN = [
  'primer-deep-penetration',
  'plaster-beacons-ceiling',
  'plaster-ceiling-main',
  'plaster-beacon-removal-ceiling',
  'putty-ceiling-2',
  'putty-sanding-ceiling',
]
const CEILING_STATE_LABELS = {
  'from-scratch': 'Потолок с нуля',
  'after-demolition': 'После демонтажа',
  prefinish: 'Предчистовая',
  'demolition-only': 'Только демонтаж',
  'local-leveling': 'Локальное выравнивание',
  'finish-only': 'Только финиш',
}
const CEILING_FINISH = { none: 'без финиша', paint: 'под покраску' }

function resolveCeilingScenarioKeys(application) {
  const { state, finishTarget } = application
  const keys = []
  switch (state) {
    case 'demolition-only':
      keys.push(CEILING_DEMOLITION[application.demolitionCovering ?? 'paint'])
      break
    case 'local-leveling':
      keys.push('putty-local-3mm', 'putty-sanding-ceiling')
      break
    case 'finish-only':
      break
    case 'from-scratch':
      keys.push(...PREP_PLASTER_CHAIN)
      break
    case 'after-demolition':
      keys.push(CEILING_DEMOLITION[application.demolitionCovering ?? 'paint'])
      keys.push('prep-dust-removal')
      keys.push(...PREP_PLASTER_CHAIN)
      break
    case 'prefinish':
      keys.push('prep-dust-removal', 'primer-one-layer', 'putty-ceiling-2', 'putty-sanding-ceiling')
      if (finishTarget === 'paint') keys.push(...PAINT_FINISH_CHAIN)
      break
  }
  if (finishTarget === 'paint' && state !== 'demolition-only' && state !== 'local-leveling') {
    if (state === 'from-scratch' || state === 'after-demolition') keys.push(...PAINT_FINISH_CHAIN)
    keys.push(CEILING_PAINT[application.paintLayers ?? 'paint-ceiling-2'])
  }
  return [...new Set(keys)]
}

function formatCeilingScenarioLabel(application) {
  const { state, finishTarget } = application
  if (state === 'demolition-only') {
    const cover = {
      paint: 'краска',
      plaster: 'штукатурка',
      putty: 'шпаклёвка',
      wallpaper: 'обои',
      'gkl-frame': 'ГКЛ с каркасом',
      suspended: 'подвесной',
      stretch: 'натяжной',
      'stretch-no-save': 'натяжной без сохранения',
      panel: 'панели',
    }
    return `Только демонтаж (${cover[application.demolitionCovering] ?? application.demolitionCovering})`
  }
  if (state === 'local-leveling') return CEILING_STATE_LABELS[state]
  if (state === 'finish-only') {
    if (finishTarget === 'paint') return 'Только финиш: покраска'
    return CEILING_STATE_LABELS[state]
  }
  if (finishTarget === 'none') return `${CEILING_STATE_LABELS[state]} (${CEILING_FINISH.none})`
  return `${CEILING_STATE_LABELS[state]} ${CEILING_FINISH[finishTarget]}`
}

// --- Tile ---
const CLAD = {
  '301-1300': 'clad-301-1300',
  '1301-1700': 'clad-1301-1700',
  '1701-3600': 'clad-1701-3600',
  'over-3600': 'clad-over-3600',
  mosaic: 'clad-mosaic',
  'small-format': 'clad-small-format',
}
const BATHROOM_PREP = ['prep-dust', 'prep-primer', 'prep-layout']
function groutKeys(grout) {
  if (grout === 'cement') return ['grout-cement', 'grout-clean-cement']
  if (grout === 'epoxy') return ['grout-epoxy', 'grout-clean-epoxy']
  return []
}
function defaultCladFormat(state) {
  if (state === 'large-format') return '1701-3600'
  return '301-1300'
}
function resolveTileScenarioKeys(application) {
  const { state } = application
  const cladFormat = application.cladFormat ?? defaultCladFormat(state)
  const grout = application.grout ?? 'cement'
  const surfaces = application.demolitionSurfaces ?? 'both'
  const keys = []
  switch (state) {
    case 'bathroom-from-scratch':
      keys.push(...BATHROOM_PREP, CLAD[cladFormat], ...groutKeys(grout))
      break
    case 'bathroom-replacement':
      keys.push('demolition-floor-tile', 'demolition-wall-tile', ...BATHROOM_PREP, CLAD[cladFormat], ...groutKeys(grout))
      break
    case 'floor-only':
    case 'walls-only':
      keys.push('prep-layout', CLAD[cladFormat], ...groutKeys(grout))
      break
    case 'kitchen-backsplash':
      keys.push('prep-layout', CLAD[cladFormat])
      break
    case 'large-format':
      keys.push('prep-layout', CLAD[cladFormat], 'cut-edge-large-small', 'hole-up-to-100')
      break
    case 'demolition-only':
      if (surfaces === 'floor' || surfaces === 'both') keys.push('demolition-floor-tile')
      if (surfaces === 'walls' || surfaces === 'both') keys.push('demolition-wall-tile')
      break
    case 'grout-repair-only':
      if (grout === 'cement') keys.push('grout-cement', 'grout-clean-cement')
      else if (grout === 'epoxy') keys.push('grout-epoxy', 'grout-clean-epoxy')
      else keys.push('repair-one-tile')
      break
  }
  return [...new Set(keys)]
}

const TILE_STATE = {
  'bathroom-from-scratch': 'Санузел с нуля',
  'bathroom-replacement': 'Замена плитки в санузле (демонтаж)',
  'floor-only': 'Плитка на пол',
  'walls-only': 'Плитка на стены',
  'kitchen-backsplash': 'Кухонный фартук',
  'large-format': 'Крупный формат',
  'demolition-only': 'Только демонтаж плитки',
  'grout-repair-only': 'Только затирка / ремонт',
}
const FORMAT_L = {
  '301-1300': '301–1300',
  '1301-1700': '1301–1700',
  '1701-3600': '1701–3600',
  'over-3600': '>3600',
  mosaic: 'мозаика',
  'small-format': 'мелкоштучка',
}
const GROUT_L = { none: 'без затирки', cement: 'цементная затирка', epoxy: 'эпоксидная затирка' }

function formatTileScenarioLabel(application) {
  const { state } = application
  const cladFormat = application.cladFormat ?? defaultCladFormat(state)
  const grout = application.grout ?? 'cement'
  const surfaces = application.demolitionSurfaces ?? 'both'
  if (state === 'demolition-only') {
    const surfaceLabel =
      surfaces === 'floor' ? 'пол' : surfaces === 'walls' ? 'стены' : 'пол и стены'
    return `Только демонтаж плитки (${surfaceLabel})`
  }
  if (state === 'bathroom-replacement') {
    return `Замена плитки в санузле (демонтаж), ${FORMAT_L[cladFormat]}, ${GROUT_L[grout]}`
  }
  if (state === 'grout-repair-only') {
    if (grout === 'none') return 'Только ремонт: замена одной плитки'
    return `Только затирка (${GROUT_L[grout]})`
  }
  if (state === 'kitchen-backsplash' || state === 'large-format') {
    return `${TILE_STATE[state]}, ${FORMAT_L[cladFormat]}`
  }
  if (grout === 'none') return `${TILE_STATE[state]}, ${FORMAT_L[cladFormat]} (${GROUT_L.none})`
  return `${TILE_STATE[state]}, ${FORMAT_L[cladFormat]}, ${GROUT_L[grout]}`
}

// --- Build MD ---
function money(n) {
  if (n == null) return '—'
  return `${n.toLocaleString('ru-RU')} ₽`
}

function linesTable(lines) {
  let md = `| № | Название в смете (mapping) | Ед. | Цена | id |\n|---|---|---|---|---|\n`
  lines.forEach((l, i) => {
    const title = l.missing ? `**${l.title}**` : l.title
    md += `| ${i + 1} | ${title} | ${l.unit} | ${money(l.unitPrice)} | \`${l.id}\` |\n`
  })
  return md
}

function sectionScenario(title, lines, note) {
  let md = `### ${title}\n\n`
  if (note) md += `${note}\n\n`
  md += `Строк в пакете: **${lines.length}**\n\n`
  md += linesTable(lines)
  md += '\n'
  return md
}

let md = `# Каталог сценариев калькулятора (строки сметы)

Документ для анализа и правок: какие **позиции из прайса/mapping** входят в каждый сценарий.

- Цены и названия взяты из ` +
  '`*_price.mapping.ts`' +
  ` (whitelist калькулятора), не из сырого PDF напрямую.
- Сценарий включает работы по стабильному \`id\` (\`priceKey\`), не по тексту названия.
- Для стен/потолков/плитки показаны **типовые** комбинации (дефолтные опции в UI: обои флизелин, покраска 2 слоя, плитка 301–1300, затирка цементная и т.п.). Варианты опций — в конце разделов.
- Объёмы подставляются из замеров при Apply; здесь только состав и **цена за единицу**.
- Дата генерации: 2026-09-10. Источник логики: \`apply-*-scenario.ts\` / \`apply-floor-preset.ts\`.

См. также краткие инструкции: [scenarios-floors](./scenarios-floors.md), [walls](./scenarios-walls.md), [ceilings](./scenarios-ceilings.md), [tile](./scenarios-tile.md), [electrics](./scenarios-electrics.md), [plumbing](./scenarios-plumbing.md).

---

## Оглавление

1. [Полы](#1-полы)
2. [Стены](#2-стены)
3. [Потолки](#3-потолки)
4. [Плитка](#4-плитка)
5. [Электрика](#5-электрика)
6. [Сантехника](#6-сантехника)

---

## 1. Полы

Код: \`floors/apply-floor-preset.ts\` + \`floor-price.mapping.ts\`.

`

const floorPlans = [
  ['Демонтаж покрытия — ламинат', ['demolition-laminate']],
  ['Демонтаж покрытия — линолеум', ['demolition-linoleum']],
  ['Демонтаж покрытия — плитка', ['demolition-floor-tile']],
  ['Демонтаж покрытия — паркетная доска', ['demolition-parquet-board']],
  ['Демонтаж покрытия — стяжка до 70 мм', ['demolition-screed-up-to-70']],
  [
    'Стяжка по плите — полусухая до 80 мм',
    ['semidry-prep', 'semidry-dust-removal', 'semidry-primer', 'semidry-screed-up-to-80'],
  ],
  [
    'Стяжка по плите — полусухая свыше 80 мм',
    ['semidry-prep', 'semidry-dust-removal', 'semidry-primer', 'semidry-screed-over-80'],
  ],
  [
    'Стяжка по плите — мокрая до 50 мм',
    ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-up-to-50'],
  ],
  [
    'Стяжка по плите — мокрая 50–80 мм',
    ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-50-to-80'],
  ],
  [
    'Стяжка по плите — мокрая свыше 80 мм',
    ['wet-prep', 'wet-dust-removal', 'wet-primer', 'wet-screed-over-80'],
  ],
  [
    'Выравнивание ровнителем',
    ['self-leveling-dust-removal', 'self-leveling-primer', 'self-leveling-device'],
  ],
  ['Мокрые зоны — акрил 1 слой', ['waterproofing-acrylic-1']],
  ['Мокрые зоны — акрил 2 слоя (по умолчанию)', ['waterproofing-acrylic-2']],
  ['Вывоз мусора — Газель до 6 м³', ['waste-gazelle-6']],
  ['Вывоз мусора — Газель до 12 м³', ['waste-gazelle-12']],
  ['Вывоз мусора — вынос вручную', ['waste-carry-out']],
]

for (const [title, keys] of floorPlans) {
  md += sectionScenario(title, dump(floors, keys))
}

md += `---

## 2. Стены

Код: \`walls/apply-wall-scenario.ts\` + \`wall-price.mapping.ts\`.

В UI: **состояние** × **цель** (без финиша / под обои / под покраску) + опции типа обоев / слоёв краски / покрытия демонтажа.

Ниже — дефолты UI: обои **флизелин**, покраска **2 слоя**.

`

const wallApps = []
for (const state of [
  'from-scratch',
  'after-demolition',
  'prefinish',
  'demolition-only',
  'local-leveling',
  'finish-only',
]) {
  if (state === 'demolition-only') {
    for (const covering of ['wallpaper', 'paint', 'plaster', 'wall-tile', 'glassfiber']) {
      wallApps.push({ state, finishTarget: 'none', demolitionCovering: covering })
    }
  } else if (state === 'local-leveling') {
    wallApps.push({ state, finishTarget: 'none' })
  } else if (state === 'finish-only') {
    wallApps.push({ state, finishTarget: 'wallpaper', wallpaperType: 'flizelin' })
    wallApps.push({ state, finishTarget: 'paint', paintLayers: 'paint-2' })
  } else {
    for (const finishTarget of ['none', 'wallpaper', 'paint']) {
      const app = { state, finishTarget }
      if (finishTarget === 'wallpaper') app.wallpaperType = 'flizelin'
      if (finishTarget === 'paint') app.paintLayers = 'paint-2'
      wallApps.push(app)
      if (state === 'from-scratch') {
        wallApps.push({ ...app, demolitionBeforeWork: true, demolitionCovering: 'wallpaper' })
      }
    }
  }
}

for (const app of wallApps) {
  md += sectionScenario(formatWallScenarioLabel(app), dump(walls, resolveWallScenarioKeys(app)))
}

md += `#### Опции стен (взаимозаменяемые)

Вместо дефолтной строки обоев / покраски в сценарии подставляется одна из:

**Тип обоев**

${linesTable([
  line(walls, 'wallpaper-flizelin'),
  line(walls, 'wallpaper-vinyl-match'),
  line(walls, 'wallpaper-photo'),
  line(walls, 'wallpaper-textile-match'),
])}

**Слои покраски**

${linesTable([
  line(walls, 'paint-1'),
  line(walls, 'paint-2'),
  line(walls, 'paint-3'),
  line(walls, 'paint-mech-2'),
])}

---

## 3. Потолки

Код: \`ceilings/apply-ceiling-scenario.ts\` + \`ceiling-price.mapping.ts\`.

Дефолт покраски: **2 слоя**. Для «После демонтажа» в примерах покрытие демонтажа = **краска** (в UI выбирается).

`

const ceilingApps = []
for (const state of [
  'from-scratch',
  'after-demolition',
  'prefinish',
  'demolition-only',
  'local-leveling',
  'finish-only',
]) {
  if (state === 'demolition-only') {
    for (const covering of [
      'paint',
      'plaster',
      'putty',
      'wallpaper',
      'gkl-frame',
      'suspended',
      'stretch',
      'stretch-no-save',
      'panel',
    ]) {
      ceilingApps.push({ state, finishTarget: 'none', demolitionCovering: covering })
    }
  } else if (state === 'local-leveling') {
    ceilingApps.push({ state, finishTarget: 'none' })
  } else if (state === 'finish-only') {
    ceilingApps.push({ state, finishTarget: 'paint', paintLayers: 'paint-ceiling-2' })
  } else {
    for (const finishTarget of ['none', 'paint']) {
      const app = { state, finishTarget }
      if (finishTarget === 'paint') app.paintLayers = 'paint-ceiling-2'
      if (state === 'after-demolition') app.demolitionCovering = 'paint'
      ceilingApps.push(app)
    }
  }
}

for (const app of ceilingApps) {
  md += sectionScenario(
    formatCeilingScenarioLabel(app),
    dump(ceilings, resolveCeilingScenarioKeys(app)),
  )
}

md += `#### Опции покраски потолка

${linesTable([
  line(ceilings, 'paint-ceiling-1'),
  line(ceilings, 'paint-ceiling-2'),
  line(ceilings, 'paint-ceiling-3'),
  line(ceilings, 'paint-ceiling-mech-2'),
])}

---

## 4. Плитка

Код: \`tile/apply-tile-scenario.ts\` + \`tile-price.mapping.ts\`.

Дефолты: формат **301–1300**, затирка **цементная** (кроме крупного формата — **1701–3600**). Гидроизоляция в сценарии **не** добавляется.

`

const tileApps = [
  { state: 'bathroom-from-scratch', cladFormat: '301-1300', grout: 'cement' },
  {
    state: 'bathroom-replacement',
    cladFormat: '301-1300',
    grout: 'cement',
    demolitionSurfaces: 'both',
  },
  { state: 'floor-only', cladFormat: '301-1300', grout: 'cement' },
  { state: 'walls-only', cladFormat: '301-1300', grout: 'cement' },
  { state: 'kitchen-backsplash', cladFormat: '301-1300' },
  { state: 'large-format', cladFormat: '1701-3600' },
  { state: 'demolition-only', demolitionSurfaces: 'both' },
  { state: 'demolition-only', demolitionSurfaces: 'floor' },
  { state: 'demolition-only', demolitionSurfaces: 'walls' },
  { state: 'grout-repair-only', grout: 'cement' },
  { state: 'grout-repair-only', grout: 'epoxy' },
  { state: 'grout-repair-only', grout: 'none' },
]

for (const app of tileApps) {
  md += sectionScenario(formatTileScenarioLabel(app), dump(tile, resolveTileScenarioKeys(app)))
}

md += `#### Опции формата облицовки (взаимозаменяемые)

${linesTable([
  line(tile, 'clad-301-1300'),
  line(tile, 'clad-1301-1700'),
  line(tile, 'clad-1701-3600'),
  line(tile, 'clad-over-3600'),
  line(tile, 'clad-mosaic'),
  line(tile, 'clad-small-format'),
])}

---

## 5. Электрика

Код: \`electrics/apply-electric-scenario.ts\` + \`electric-price.mapping.ts\`.

В runtime включаются только строки с **положительным** рассчитанным объёмом по счётчикам. Ниже — полный типовой пакет ключей сценария.

**Щит:** в коде шаблон \`…-12\`; при Apply подставляется \`12\` / \`18\` / \`24\` по счётчику модулей (цены у семейства разные — смотрите mapping).

`

const electricPlans = [
  [
    'Электрика квартиры с нуля',
    [
      'layout-routes',
      'layout-supply-points',
      'chase-concrete-to-35',
      'cable-chase-1-5-2-5',
      'hole-podrozetnik-concrete',
      'podrozetnik-fix',
      'junction-wago',
      'panel-enclosure-outdoor-12',
      'panel-assembly-12',
      'finish-outlet-switch',
      'finish-spot',
      'check-group-after-mount',
    ],
  ],
  [
    'Перекоммутация комнаты',
    [
      'layout-supply-points',
      'chase-brick-to-35',
      'cable-chase-1-5-2-5',
      'hole-podrozetnik-brick',
      'podrozetnik-fix',
      'finish-outlet-switch',
      'finish-spot',
    ],
  ],
  [
    'Электрика кухни',
    [
      'chase-concrete-to-35',
      'cable-chase-1-5-2-5',
      'hole-podrozetnik-concrete',
      'podrozetnik-fix',
      'finish-outlet-switch',
      'appliance-generic',
    ],
  ],
  [
    'Электрика санузла',
    [
      'chase-brick-to-35',
      'cable-chase-1-5-2-5',
      'hole-podrozetnik-brick',
      'podrozetnik-fix',
      'finish-outlet-wet',
      'finish-spot',
      'earthing-bath',
      'appliance-towel-ready',
    ],
  ],
  ['Только освещение', ['finish-spot']],
  ['Розетки и выключатели', ['finish-outlet-switch']],
  ['Слаботочные сети', ['cable-utp', 'finish-rj45', 'low-current-test-internet']],
  [
    'Только электрощит',
    ['panel-enclosure-outdoor-12', 'panel-assembly-12', 'check-panel-after-assembly'],
  ],
  ['Только демонтаж электрики', ['demolition-outlets', 'demolition-cable']],
]

for (const [title, keys] of electricPlans) {
  md += sectionScenario(title, dump(electric, keys))
}

md += `---

## 6. Сантехника

Код: \`plumbing/apply-plumbing-scenario.ts\` + \`plumbing-price.mapping.ts\`.

Как у электрики: в runtime часть строк может не включиться при нулевых счётчиках.

`

const plumbingPlans = [
  [
    'Сантехника санузла с нуля',
    [
      'drainage-layout',
      'drainage-pipe-d32-50',
      'drainage-outlet-fix',
      'water-layout',
      'water-pipe-d16-20',
      'water-outlet',
      'conn-opress-water',
      'install-frame',
      'install-water-connect',
      'install-sewer-connect',
      'finish-toilet-soft',
      'finish-sink-ordinary',
      'finish-sink-mixer',
      'finish-bath-acrylic',
      'check-water-start',
    ],
  ],
  [
    'Замена сантехники в санузле',
    [
      'demolition-toilet',
      'demolition-sink',
      'demolition-bath',
      'demolition-mixer',
      'finish-toilet-soft',
      'finish-sink-ordinary',
      'finish-sink-mixer',
      'finish-bath-acrylic',
      'check-finish',
    ],
  ],
  [
    'Кухня',
    [
      'drainage-pipe-d32-50',
      'drainage-outlet-fix',
      'water-pipe-d16-20',
      'water-outlet',
      'finish-kitchen-sink',
      'finish-kitchen-mixer',
      'finish-dishwasher',
      'conn-opress-water',
    ],
  ],
  [
    'Ванная',
    ['finish-bath-acrylic', 'finish-bath-mixer', 'finish-siphon-bath', 'finish-shower-tray'],
  ],
  [
    'Туалет',
    [
      'install-frame',
      'install-water-connect',
      'install-sewer-connect',
      'finish-toilet-soft',
      'drainage-pipe-d110',
      'water-pipe-d16-20',
      'water-outlet',
    ],
  ],
  [
    'Коллекторный узел',
    [
      'manifold-cabinet-surface',
      'manifold-beam',
      'manifold-inlet',
      'manifold-filter-coarse',
      'manifold-reducer',
      'manifold-water-meter',
      'conn-opress-water',
    ],
  ],
  [
    'Канализация',
    [
      'drainage-layout',
      'drainage-pipe-d32-50',
      'drainage-outlet-fix',
      'drainage-slope',
      'drainage-test-flush',
    ],
  ],
  [
    'Водоснабжение',
    [
      'water-layout',
      'water-pipe-d16-20',
      'water-outlet',
      'water-outlet-fix',
      'conn-opress-water',
    ],
  ],
  [
    'Подключение приборов',
    [
      'finish-toilet-soft',
      'finish-sink-ordinary',
      'finish-sink-mixer',
      'finish-washer',
      'finish-dishwasher',
      'check-finish',
    ],
  ],
  [
    'Только демонтаж',
    ['demolition-toilet', 'demolition-sink', 'demolition-bath', 'demolition-mixer'],
  ],
]

for (const [title, keys] of plumbingPlans) {
  md += sectionScenario(title, dump(plumbing, keys))
}

md += `---

## Как править

1. Найти нужный сценарий в этом файле.
2. Решить: убрать / добавить / заменить строку.
3. В коде поправить список ключей в соответствующем \`apply-*-scenario.ts\` (полы — \`apply-floor-preset.ts\`).
4. Убедиться, что \`id\` есть в \`*_price.mapping.ts\` (иначе строка не создастся).
5. Перегенерировать этот каталог скриптом \`scripts/build-scenarios-catalog.mjs\` после правок mapping/сценариев.

`

const outMd = path.join(root, 'docs/estimate-calculator/scenarios-catalog.md')
writeFileSync(outMd, `${md.trimEnd()}\n`, 'utf8')
console.log('wrote', outMd, 'chars', md.length)

// sanity: count missing
let missing = 0
const check = (lines) => lines.forEach((l) => { if (l.missing) missing++ })
floorPlans.forEach(([, k]) => check(dump(floors, k)))
wallApps.forEach((a) => check(dump(walls, resolveWallScenarioKeys(a))))
ceilingApps.forEach((a) => check(dump(ceilings, resolveCeilingScenarioKeys(a))))
tileApps.forEach((a) => check(dump(tile, resolveTileScenarioKeys(a))))
electricPlans.forEach(([, k]) => check(dump(electric, k)))
plumbingPlans.forEach(([, k]) => check(dump(plumbing, k)))
console.log('missing keys total references:', missing)

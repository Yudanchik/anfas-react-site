import {
  CEILING_PRICE_MAPPING,
  CEILING_SECTION_ID,
  ELECTRIC_PRICE_MAPPING,
  ELECTRIC_SECTION_ID,
  FLOOR_PRICE_MAPPING,
  FLOOR_SECTION_ID,
  getCeilingEstimateGroupTitle,
  getElectricEstimateGroupTitle,
  getFloorEstimateGroupTitle,
  getPlumbingEstimateGroupTitle,
  getTileEstimateGroupTitle,
  getWallEstimateGroupTitle,
  resolveCeilingEstimateGroupId,
  resolveElectricEstimateGroupId,
  resolveFloorEstimateGroupId,
  resolvePlumbingEstimateGroupId,
  resolveTileEstimateGroupId,
  resolveWallEstimateGroupId,
  PLUMBING_PRICE_MAPPING,
  PLUMBING_SECTION_ID,
  TILE_PRICE_MAPPING,
  TILE_SECTION_ID,
  WALL_PRICE_MAPPING,
  WALL_SECTION_ID,
  type EstimatePriceProfile,
  type EstimatePriceProfileImportResult,
  type EstimatePriceProfileItem,
  type EstimatePriceProfileMappingItem,
  type EstimatePriceProfileSectionId,
} from '@/entities/estimate'
import { documentFilename, downloadEstimateFile } from './estimate-document'

export const PRICE_PROFILE_STORAGE_KEY = 'anfas:estimate-price-profile:v1'

const TEMPLATE_FORMAT = 'anfas-estimate-price-template'
const TEMPLATE_VERSION = '1'
const MAX_XLSX_SIZE = 2_000_000

type TemplateRow = {
  Раздел: string
  Группа: string
  'Название работы': string
  'Ед. изм.': string
  Цена: number
  Использовать: string
  Комментарий: string
  work_id: string
  section: EstimatePriceProfileSectionId
  group: string
  unit: string
  scenario_role: string
  line_kind: 'labour'
}

type SectionConfig = {
  sectionId: EstimatePriceProfileSectionId
  sectionLabel: string
  mapping: readonly EstimatePriceProfileMappingItem[]
  groupTitle: (item: EstimatePriceProfileMappingItem) => string
}

const SECTION_CONFIGS: readonly SectionConfig[] = [
  {
    sectionId: FLOOR_SECTION_ID,
    sectionLabel: 'Полы',
    mapping: FLOOR_PRICE_MAPPING,
    groupTitle: (item) =>
      getFloorEstimateGroupTitle(resolveFloorEstimateGroupId({ kind: item.kind, source: item.source })),
  },
  {
    sectionId: WALL_SECTION_ID,
    sectionLabel: 'Стены',
    mapping: WALL_PRICE_MAPPING,
    groupTitle: (item) =>
      getWallEstimateGroupTitle(resolveWallEstimateGroupId({ kind: item.kind, source: item.source })),
  },
  {
    sectionId: CEILING_SECTION_ID,
    sectionLabel: 'Потолки',
    mapping: CEILING_PRICE_MAPPING,
    groupTitle: (item) =>
      getCeilingEstimateGroupTitle(
        resolveCeilingEstimateGroupId({ kind: item.kind, source: item.source }),
      ),
  },
  {
    sectionId: TILE_SECTION_ID,
    sectionLabel: 'Плитка',
    mapping: TILE_PRICE_MAPPING,
    groupTitle: (item) =>
      getTileEstimateGroupTitle(resolveTileEstimateGroupId({ kind: item.kind, source: item.source })),
  },
  {
    sectionId: ELECTRIC_SECTION_ID,
    sectionLabel: 'Электрика',
    mapping: ELECTRIC_PRICE_MAPPING,
    groupTitle: (item) =>
      getElectricEstimateGroupTitle(
        resolveElectricEstimateGroupId({ kind: item.kind, source: item.source }),
      ),
  },
  {
    sectionId: PLUMBING_SECTION_ID,
    sectionLabel: 'Сантехника',
    mapping: PLUMBING_PRICE_MAPPING,
    groupTitle: (item) =>
      getPlumbingEstimateGroupTitle(
        resolvePlumbingEstimateGroupId({ kind: item.kind, source: item.source }),
      ),
  },
] as const

const VISIBLE_HEADERS = [
  'Раздел',
  'Группа',
  'Название работы',
  'Ед. изм.',
  'Цена',
  'Использовать',
  'Комментарий',
] as const

const SERVICE_HEADERS = [
  'work_id',
  'section',
  'group',
  'unit',
  'scenario_role',
  'line_kind',
] as const

const HEADERS = [...VISIBLE_HEADERS, ...SERVICE_HEADERS] as const

export function readEstimatePriceProfile(): EstimatePriceProfile | null {
  try {
    const raw = localStorage.getItem(PRICE_PROFILE_STORAGE_KEY)
    if (!raw) return null
    return parseStoredPriceProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeEstimatePriceProfile(profile: EstimatePriceProfile | null): boolean {
  try {
    if (!profile) localStorage.removeItem(PRICE_PROFILE_STORAGE_KEY)
    else localStorage.setItem(PRICE_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}

export async function downloadEstimatePriceTemplate() {
  const XLSX = await import('xlsx')
  const rows = buildTemplateRows()
  const workbook = XLSX.utils.book_new()
  workbook.Props = {
    Title: 'Шаблон прайс-листа Anfas',
    Subject: TEMPLATE_FORMAT,
    Comments: `format=${TEMPLATE_FORMAT};version=${TEMPLATE_VERSION}`,
  }
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...HEADERS] })
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 26 },
    { wch: 76 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 32 },
    { hidden: true, wch: 28 },
    { hidden: true, wch: 14 },
    { hidden: true, wch: 18 },
    { hidden: true, wch: 10 },
    { hidden: true, wch: 34 },
    { hidden: true, wch: 12 },
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Прайс')

  const readme = XLSX.utils.aoa_to_sheet([
    ['Шаблон прайс-листа Anfas'],
    ['Редактируйте только название работы, цену, флаг "Использовать" и комментарий.'],
    ['"Использовать = да" означает, что работа доступна в прайсе и сценариях; это не включает строку в смету автоматически.'],
    ['Служебные поля скрыты: они нужны сценариям калькулятора и не должны меняться.'],
    ['Импорт поддерживает только XLSX, созданный из этого шаблона. PDF и CSV не принимаются.'],
    ['Смена прайса по умолчанию не пересчитывает уже сохранённые суммы сметы — только новые работы.'],
  ])
  readme['!cols'] = [{ wch: 110 }]
  XLSX.utils.book_append_sheet(workbook, readme, 'Инструкция')

  const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  downloadEstimateFile(
    new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    documentFilename(
      { number: '', date: '', customer: '', object: '', estimator: '', note: '' },
      'xlsx',
    ),
  )
}

export async function parseEstimatePriceProfileXlsx(
  file: File,
): Promise<EstimatePriceProfileImportResult> {
  const errors: string[] = []
  const warnings: string[] = []

  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return {
      errors: [
        'Загрузите XLSX-файл, созданный из шаблона прайс-листа. PDF и CSV не поддерживаются.',
      ],
      warnings,
      changedCount: 0,
      inactiveCount: 0,
    }
  }
  if (file.size > MAX_XLSX_SIZE) {
    return {
      errors: ['Файл больше 2 МБ. Скачайте новый шаблон и загрузите только рабочий прайс.'],
      warnings,
      changedCount: 0,
      inactiveCount: 0,
    }
  }

  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const sheet = workbook.Sheets['Прайс'] ?? workbook.Sheets[workbook.SheetNames[0] ?? '']
    if (!sheet) throw new Error('sheet')
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    })
    const parsed = parseTemplateRows(rows, errors, warnings)

    if (errors.length > 0) {
      return { errors, warnings, changedCount: 0, inactiveCount: 0 }
    }

    const profile: EstimatePriceProfile = {
      id: `user-xlsx:${Date.now()}`,
      name: file.name.replace(/\.xlsx$/i, '').trim() || 'Пользовательский прайс',
      source: 'user-xlsx',
      createdAt: new Date().toISOString(),
      contentHash: hashProfileItems(parsed.items),
      items: parsed.items,
    }

    return {
      profile,
      errors,
      warnings,
      changedCount: parsed.changedCount,
      inactiveCount: parsed.inactiveCount,
    }
  } catch {
    return {
      errors: [
        'Не удалось прочитать XLSX. Скачайте новый шаблон и заполните его без изменения структуры.',
      ],
      warnings,
      changedCount: 0,
      inactiveCount: 0,
    }
  }
}

export function describePriceProfile(profile: EstimatePriceProfile | null): string {
  if (!profile) return 'Anfas, встроенный прайс'
  return `${profile.name} · ${profile.items.length} работ`
}

function buildTemplateRows(): TemplateRow[] {
  return SECTION_CONFIGS.flatMap((section) =>
    section.mapping.map((item) => ({
      Раздел: section.sectionLabel,
      Группа: section.groupTitle(item),
      'Название работы': item.title,
      'Ед. изм.': item.unit,
      Цена: item.unitPrice,
      Использовать: 'да',
      Комментарий: item.note ?? '',
      work_id: item.id,
      section: section.sectionId,
      group: String(item.kind),
      unit: item.unit,
      scenario_role: `${section.sectionId}.${item.id}`,
      line_kind: 'labour',
    })),
  )
}

function parseTemplateRows(
  rows: readonly Record<string, unknown>[],
  errors: string[],
  warnings: string[],
): { items: EstimatePriceProfileItem[]; changedCount: number; inactiveCount: number } {
  const builtin = new Map<string, EstimatePriceProfileMappingItem>()
  const seen = new Set<string>()
  const items: EstimatePriceProfileItem[] = []
  let changedCount = 0
  let inactiveCount = 0

  for (const section of SECTION_CONFIGS) {
    for (const item of section.mapping) {
      builtin.set(`${section.sectionId}:${item.id}`, item)
    }
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const workId = stringCell(row.work_id)
    const sectionId = stringCell(row.section) as EstimatePriceProfileSectionId
    const lineKind = stringCell(row.line_kind)

    if (!workId && hasUserContent(row)) {
      warnings.push(
        `Строка ${rowNumber}: нет work_id, строка пропущена и не будет участвовать в сценариях.`,
      )
      return
    }
    if (!workId && !hasUserContent(row)) return
    if (lineKind !== 'labour') {
      warnings.push(
        `Строка ${rowNumber}: line_kind=${lineKind || 'пусто'} пропущен, калькулятор принимает только работы.`,
      )
      return
    }

    const key = `${sectionId}:${workId}`
    const base = builtin.get(key)
    if (!base) {
      errors.push(
        `Строка ${rowNumber}: неизвестный системный код работы ${key}. Скачайте свежий шаблон.`,
      )
      return
    }
    if (seen.has(key)) {
      errors.push(`Строка ${rowNumber}: дубль work_id ${workId} в разделе ${sectionId}.`)
      return
    }
    seen.add(key)

    const title = stringCell(row['Название работы']) || base.title
    const visibleUnit = stringCell(row['Ед. изм.'])
    const serviceUnit = stringCell(row.unit)
    const unit = serviceUnit || base.unit
    if (visibleUnit && visibleUnit !== base.unit) {
      warnings.push(
        `Строка ${rowNumber}: единица "${visibleUnit}" отличается от системной "${base.unit}", сценарии используют системную.`,
      )
    }

    const unitPrice = numberCell(row['Цена'])
    const active = boolCell(row['Использовать'])
    if (active && !(unitPrice > 0)) {
      errors.push(`Строка ${rowNumber}: для активной работы "${title}" укажите цену больше 0.`)
      return
    }
    if (!active) inactiveCount += 1
    if (title !== base.title || unitPrice !== base.unitPrice || !active) changedCount += 1

    items.push({
      workId,
      sectionId,
      title,
      unit,
      unitPrice,
      active,
      comment: stringCell(row['Комментарий']) || undefined,
    })
  })

  for (const key of builtin.keys()) {
    if (!seen.has(key))
      errors.push(`В шаблоне отсутствует обязательная работа ${key}. Скачайте свежий шаблон.`)
  }

  return { items, changedCount, inactiveCount }
}

function parseStoredPriceProfile(data: unknown): EstimatePriceProfile | null {
  if (!data || typeof data !== 'object') return null
  const profile = data as Partial<EstimatePriceProfile>
  if (profile.source !== 'user-xlsx' || !Array.isArray(profile.items)) return null
  return {
    id: typeof profile.id === 'string' ? profile.id : 'user-xlsx:restored',
    name: typeof profile.name === 'string' ? profile.name : 'Пользовательский прайс',
    source: 'user-xlsx',
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : new Date().toISOString(),
    contentHash: typeof profile.contentHash === 'string' ? profile.contentHash : '',
    items: profile.items.filter(isProfileItem),
  }
}

function isProfileItem(value: unknown): value is EstimatePriceProfileItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<EstimatePriceProfileItem>
  return (
    typeof item.workId === 'string' &&
    typeof item.sectionId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.unit === 'string' &&
    typeof item.unitPrice === 'number' &&
    typeof item.active === 'boolean'
  )
}

function hasUserContent(row: Record<string, unknown>): boolean {
  return ['Название работы', 'Цена', 'Использовать', 'Комментарий'].some((key) =>
    stringCell(row[key]),
  )
}

function stringCell(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function numberCell(value: unknown): number {
  const normalized = stringCell(value).replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : NaN
}

function boolCell(value: unknown): boolean {
  const normalized = stringCell(value).toLowerCase()
  return !['нет', 'no', 'false', '0', 'выкл', 'off'].includes(normalized)
}

function hashProfileItems(items: readonly EstimatePriceProfileItem[]): string {
  const source = items
    .map(
      (item) => `${item.sectionId}:${item.workId}:${item.title}:${item.unitPrice}:${item.active}`,
    )
    .join('|')
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

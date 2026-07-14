export const briefServiceOptions = [
  { value: 'general', label: 'Нужна консультация' },
  { value: 'individual', label: 'Индивидуальный ремонт' },
  { value: 'package', label: 'Пакетный ремонт' },
] as const

export type BriefService = (typeof briefServiceOptions)[number]['value']

export const briefServiceCopy: Record<
  BriefService,
  {
    eyebrow: string
    title: string
    lead: string
    serviceNote: string
    submitLabel: string
    successTitle: string
    successLead: string
  }
> = {
  general: {
    eyebrow: 'Начнём знакомство',
    title: 'Обсудим ваш ремонт',
    lead: 'Коротко разберём задачу, подскажем формат и следующий понятный шаг.',
    serviceNote: 'Формат ремонта подберём после короткого разговора.',
    submitLabel: 'Отправить заявку',
    successTitle: 'Заявка принята',
    successLead: 'Мы свяжемся с вами, уточним задачу и подскажем подходящий формат ремонта.',
  },
  individual: {
    eyebrow: 'Индивидуальный формат',
    title: 'Индивидуальный ремонт',
    lead: 'Для проекта под ваш образ жизни: планировка, дизайн, материалы и реализация в одной команде.',
    serviceNote: 'В заявке уже выбран индивидуальный формат.',
    submitLabel: 'Обсудить индивидуальный ремонт',
    successTitle: 'Индивидуальный формат выбран',
    successLead: 'Мы свяжемся с вами, уточним квартиру, задачи и предложим первый сценарий проекта.',
  },
  package: {
    eyebrow: 'Пакетный формат',
    title: 'Пакетный ремонт',
    lead: 'Для быстрого старта: готовая эстетика, понятная цена, материалы и сроки без лишних согласований.',
    serviceNote: 'В заявке уже выбран пакетный формат.',
    submitLabel: 'Обсудить пакетный ремонт',
    successTitle: 'Пакетный формат выбран',
    successLead: 'Мы свяжемся с вами, уточним площадь, задачи и покажем подходящий пакетный сценарий.',
  },
}

export function sanitizeNameValue(value: string) {
  return value.replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 48)
}

export function normalizePhoneDigits(value: string) {
  const digits = value.replace(/\D/g, '')

  if (!digits) return ''
  if (digits[0] === '8') return `7${digits.slice(1, 11)}`
  if (digits[0] !== '7') return `7${digits.slice(0, 10)}`

  return digits.slice(0, 11)
}

export function formatPhoneValue(value: string) {
  const digits = normalizePhoneDigits(value)

  if (!digits) return ''

  const country = digits[0]
  const code = digits.slice(1, 4)
  const part1 = digits.slice(4, 7)
  const part2 = digits.slice(7, 9)
  const part3 = digits.slice(9, 11)

  let result = `+${country}`

  if (code) result += ` (${code}`
  if (code.length === 3) result += ')'
  if (part1) result += ` ${part1}`
  if (part2) result += `-${part2}`
  if (part3) result += `-${part3}`

  return result
}

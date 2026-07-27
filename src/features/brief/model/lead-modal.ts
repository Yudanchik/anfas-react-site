import type { CalculatorLeadContext } from '../model/calculator-lead-context'

import type { BriefService } from './brief.form'

export type ModalIntent =
  | 'consultation'
  | 'individual'
  | 'package'
  | 'calculation'
  | 'brief'
  | 'custom'

export type LeadModalPreset = {
  eyebrow: string
  title: string
  description: string
  selectedLabel: string
  selectedDescription: string
  submitLabel: string
  requestType: BriefService
  successTitle: string
  successDescription: string
}

export type LeadModalOpenOptions = {
  intent: ModalIntent
  source?: string
  projectSlug?: string
  requestType?: BriefService
  analyticsEvent?: string
  calculatorContext?: CalculatorLeadContext
  customPreset?: Partial<LeadModalPreset>
}

export const leadModalPresets: Record<ModalIntent, LeadModalPreset> = {
  consultation: {
    eyebrow: 'Начнём знакомство',
    title: 'Обсудим ваш ремонт',
    description: 'Коротко разберём задачу, подскажем формат и следующий понятный шаг.',
    selectedLabel: 'Консультация по проекту',
    selectedDescription: 'Формат ремонта подберём после короткого разговора.',
    submitLabel: 'Отправить заявку',
    requestType: 'general',
    successTitle: 'Заявка принята',
    successDescription:
      'Мы свяжемся с вами, уточним задачу и подскажем подходящий формат ремонта.',
  },
  individual: {
    eyebrow: 'Индивидуальный формат',
    title: 'Индивидуальный ремонт',
    description:
      'Для проекта под ваш образ жизни: планировка, дизайн, материалы и реализация в одной команде.',
    selectedLabel: 'Индивидуальный ремонт',
    selectedDescription: 'В заявке уже выбран индивидуальный формат.',
    submitLabel: 'Обсудить индивидуальный ремонт',
    requestType: 'individual',
    successTitle: 'Индивидуальный формат выбран',
    successDescription:
      'Мы свяжемся с вами, уточним квартиру, задачи и предложим первый сценарий проекта.',
  },
  package: {
    eyebrow: 'Пакетный формат',
    title: 'Пакетный ремонт',
    description:
      'Для быстрого старта: готовая эстетика, понятная цена, материалы и сроки без лишних согласований.',
    selectedLabel: 'Пакетный ремонт',
    selectedDescription: 'В заявке уже выбран пакетный формат.',
    submitLabel: 'Обсудить пакетный ремонт',
    requestType: 'package',
    successTitle: 'Пакетный формат выбран',
    successDescription:
      'Мы свяжемся с вами, уточним площадь, задачи и покажем подходящий пакетный сценарий.',
  },
  calculation: {
    eyebrow: 'Предварительный расчёт',
    title: 'Уточним расчёт ремонта',
    description:
      'Проверим параметры квартиры и подготовим более точный ориентир по бюджету и срокам.',
    selectedLabel: 'Расчёт стоимости',
    selectedDescription: 'Выбранный в калькуляторе формат будет сохранён в заявке.',
    submitLabel: 'Получить расчёт',
    requestType: 'package',
    successTitle: 'Запрос на расчёт принят',
    successDescription:
      'Мы свяжемся с вами, уточним параметры объекта и подготовим более точный ориентир.',
  },
  brief: {
    eyebrow: 'Короткий бриф',
    title: 'Расскажите о будущем интерьере',
    description:
      'Начнём с имени и телефона, а детали спокойно уточним во время первого разговора.',
    selectedLabel: 'Короткий бриф',
    selectedDescription: 'Подойдёт, если вы пока выбираете формат и хотите начать с вопросов.',
    submitLabel: 'Заполнить короткий бриф',
    requestType: 'general',
    successTitle: 'Бриф принят',
    successDescription:
      'Мы свяжемся с вами, зададим несколько уточняющих вопросов и предложим следующий шаг.',
  },
  custom: {
    eyebrow: 'Ваш проект',
    title: 'Обсудим детали',
    description: 'Расскажите, как с вами связаться, и мы продолжим разговор о задаче.',
    selectedLabel: 'Индивидуальный запрос',
    selectedDescription: 'Детали запроса уточним во время первого разговора.',
    submitLabel: 'Отправить заявку',
    requestType: 'general',
    successTitle: 'Заявка принята',
    successDescription: 'Мы свяжемся с вами и уточним детали проекта.',
  },
}

export function getLeadModalPreset(options: LeadModalOpenOptions): LeadModalPreset {
  const preset = leadModalPresets[options.intent]

  return {
    ...preset,
    ...options.customPreset,
    requestType: options.requestType ?? options.customPreset?.requestType ?? preset.requestType,
  }
}

import individualFormatImage from '@/assets/images/formats/individual-format.webp'
import packageFormatImage from '@/assets/images/formats/package-format.webp'

export type Service = {
  id: 'individual' | 'package'
  number: string
  title: string
  text: string
  tags: readonly string[]
  image: string
  imageWidth: number
  imageHeight: number
  lead: string
  bullets: readonly string[]
  metrics: ReadonlyArray<{
    value: string
    label: string
  }>
  price: string
  duration: string
  ctaLabel: string
}

export const services: readonly Service[] = [
  {
    id: 'individual',
    number: '01',
    title: 'Индивидуальный ремонт',
    text: 'Формат для тех, кому нужен персональный интерьер, гибкая планировка, авторский подбор материалов и реализация под ваш сценарий жизни.',
    tags: ['Дизайн-проект', 'Материалы', 'Авторский контроль'],
    image: individualFormatImage,
    imageWidth: 1448,
    imageHeight: 1086,
    lead: 'Сначала проектируем пространство под вас, затем доводим идею до реализации одной командой без потери смысла и качества.',
    bullets: [
      'персональная планировка и визуальный образ интерьера',
      'индивидуальный подбор отделки, света, мебели и декора',
      'авторский надзор и контроль результата на объекте',
      'подходит для сложных квартир и нестандартных задач',
    ],
    metrics: [
      { value: '8–14 мес', label: 'средний срок реализации' },
      { value: 'от 9 000 ₽/м²', label: 'стоимость дизайн-проекта' },
    ],
    price: 'от 9 000 ₽ / м²',
    duration: 'от 8 до 14 месяцев',
    ctaLabel: 'Хочу индивидуальный ремонт',
  },
  {
    id: 'package',
    number: '02',
    title: 'Пакетный ремонт',
    text: 'Готовый формат для тех, кто хочет быстро получить стильный интерьер: материалы, смета, сроки и состав работ ясны ещё до старта.',
    tags: ['Фиксированная цена', 'Быстрый запуск', 'Готовые эстетики'],
    image: packageFormatImage,
    imageWidth: 1448,
    imageHeight: 1086,
    lead: 'Собираем понятный пакет решений и ведём ремонт в согласованном темпе — без десятков отдельных согласований.',
    bullets: [
      '3–4 готовые эстетики и собранные решения по отделке',
      'понятная рамка бюджета и состава работ до запуска',
      'быстрее старт, меньше решений на вашей стороне',
      'подходит для тех, кто хочет ремонт без перегруза деталями',
    ],
    metrics: [
      { value: '3–5 мес', label: 'средний срок реализации' },
      { value: 'от 49 000 ₽/м²', label: 'стоимость ремонта за м²' },
    ],
    price: 'от 49 000 ₽ / м²',
    duration: 'от 3 до 5 месяцев',
    ctaLabel: 'Хочу пакетный ремонт',
  },
] as const

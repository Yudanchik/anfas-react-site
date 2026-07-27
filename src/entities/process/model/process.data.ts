import processConcept from '@/assets/images/process/process-concept.webp'
import processDelivery from '@/assets/images/process/process-delivery.webp'
import processEstimate from '@/assets/images/process/process-estimate.webp'
import processStart from '@/assets/images/process/process-start.webp'
import processSupply from '@/assets/images/process/process-supply.webp'

export type ProcessStep = {
  mark: string
  label: string
  title: string
  text: string
  visualTitle: string
  visualText: string
  visualImage: string
  visualWidth: number
  visualHeight: number
  visualPosition: string
  stats: ReadonlyArray<{
    value: string
    label: string
  }>
}

export const processSteps: ReadonlyArray<ProcessStep> = [
  {
    mark: '01',
    label: 'Старт проекта',
    title: 'Бриф и замер квартиры',
    text: 'Созваниваемся, обсуждаем задачи проекта, выезжаем на объект и фиксируем исходные данные до первого решения.',
    visualTitle: 'Понимаем задачу ещё до старта дизайна.',
    visualText:
      'На первой встрече собираем сценарий жизни, ограничения по срокам, бюджету и пожеланиям к интерьеру. Это снимает лишние вопросы и делает дальнейшие решения точнее.',
    visualImage: processStart,
    visualWidth: 1448,
    visualHeight: 1086,
    visualPosition: 'center center',
    stats: [
      { value: '1 встреча', label: 'чтобы собрать исходные данные' },
      { value: '0 догадок', label: 'всё фиксируем до концепции' },
    ],
  },
  {
    mark: '02',
    label: 'Концепция',
    title: 'Планировка и образ интерьера',
    text: 'Показываем, как будет работать пространство: логика зон, стилистика, свет, материалы и настроение будущего интерьера.',
    visualTitle: 'Собираем интерьер в понятную систему.',
    visualText:
      'Вы заранее видите, каким станет пространство и почему каждое решение работает именно для вашего ритма жизни, а не просто выглядит красиво на картинке.',
    visualImage: processConcept,
    visualWidth: 1448,
    visualHeight: 1086,
    visualPosition: 'center center',
    stats: [
      { value: '1 логика', label: 'планировка, стиль и свет в связке' },
      { value: '100%', label: 'решения объясняем до согласования' },
    ],
  },
  {
    mark: '03',
    label: 'Смета и сроки',
    title: 'Бюджет, этапы и календарный ритм',
    text: 'Собираем открытую смету, фиксируем рамку бюджета и раскладываем работы по этапам — без плавающих дедлайнов и неожиданностей.',
    visualTitle: 'Сроки и бюджет понятны до запуска работ.',
    visualText:
      'Мы заранее собираем состав работ, ключевые поставки и последовательность этапов, чтобы у проекта был понятный темп и предсказуемая финансовая рамка.',
    visualImage: processEstimate,
    visualWidth: 1448,
    visualHeight: 1086,
    visualPosition: 'center center',
    stats: [
      { value: '1 смета', label: 'собрана под весь проект' },
      { value: 'по этапам', label: 'каждый шаг имеет срок и объём' },
    ],
  },
  {
    mark: '04',
    label: 'Комплектация',
    title: 'Материалы, свет и поставки',
    text: 'Подбираем и заказываем всё, что нужно для реализации: чистовые материалы, сантехнику, свет, мебель и позиции под проект.',
    visualTitle: 'Комплектация без десятков хаотичных поездок.',
    visualText:
      'Команда держит ведомости, позиции и сроки поставок под контролем. Вы не тратите недели на бесконечные поиски и не собираете проект вручную.',
    visualImage: processSupply,
    visualWidth: 1448,
    visualHeight: 1086,
    visualPosition: 'center center',
    stats: [
      { value: '1 команда', label: 'ведёт стройку и комплектацию вместе' },
      { value: 'по плану', label: 'материалы привязаны к этапам' },
    ],
  },
  {
    mark: '05',
    label: 'Реализация',
    title: 'Контроль стройки и финальная сдача',
    text: 'Следим за качеством на объекте, сверяем узлы, держим темп работ и доводим интерьер до готового состояния без нервного ручного управления.',
    visualTitle: 'Финальный результат совпадает с замыслом.',
    visualText:
      'На этапе реализации проверяем качество исполнения, закрываем вопросы по ходу работ и приводим квартиру к состоянию, в которое можно спокойно заезжать.',
    visualImage: processDelivery,
    visualWidth: 1448,
    visualHeight: 1086,
    visualPosition: 'center center',
    stats: [
      { value: 'до сдачи', label: 'сопровождаем объект без потерь' },
      { value: '1 итог', label: 'готовый интерьер, а не незакрытый список задач' },
    ],
  },
] as const

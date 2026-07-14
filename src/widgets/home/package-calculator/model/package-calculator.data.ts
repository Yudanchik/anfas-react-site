export const packageCalculator = {
  eyebrow: 'Мини-калькулятор',
  title: 'Быстрый ориентир по стоимости ремонта',
  lead:
    'Пакетный сценарий даёт фиксированную цену за м². Индивидуальный — более точную вилку с учётом площади, уровня отделки и состава работ.',
  areaMarks: [35, 45, 60, 80, 100, 130],
  packageVariants: [
    {
      label: 'Базовая комплектация',
      helper: 'Для быстрого старта и спокойного бюджета.',
      value: 'base',
      ratePerM2: 49000,
      durationMonths: 4,
    },
    {
      label: 'Стандарт',
      helper: 'Самый сбалансированный сценарий по цене и наполнению.',
      value: 'standard',
      ratePerM2: 53000,
      durationMonths: 5,
    },
    {
      label: 'Комфорт',
      helper: 'Больше внимания к деталям, материалам и комплектности.',
      value: 'comfort',
      ratePerM2: 58000,
      durationMonths: 5,
    },
    {
      label: 'Премиум',
      helper: 'Максимум контроля, выше уровень отделки и комплектации.',
      value: 'premium',
      ratePerM2: 64000,
      durationMonths: 6,
    },
  ],
  propertyTypes: [
    {
      label: 'Новостройка',
      value: 'new',
      helper: 'Больше предсказуемости и меньше скрытых сюрпризов на объекте.',
    },
    {
      label: 'Вторичка',
      value: 'secondary',
      helper: 'Обычно требует больше подготовительных работ и аккуратности.',
    },
  ],
  finishLevels: [
    { label: 'Базовый', value: 'basic' },
    { label: 'Стандарт', value: 'standard' },
    { label: 'Премиум', value: 'premium' },
  ],
  complexityLevels: [
    { label: 'Без перепланировки', value: 'simple' },
    { label: 'С планировкой', value: 'normal' },
    { label: 'Сложный сценарий', value: 'complex' },
  ],
  options: [
    {
      label: 'Инженерные работы',
      helper: 'электрика, сантехника, вентиляция',
      value: 'engineering',
      modes: ['individual'],
      cost: 360000,
      weeks: 2,
    },
    {
      label: 'Комплектация мебелью',
      helper: 'подбор и заказ мебельных позиций',
      value: 'furniture',
      modes: ['individual'],
      cost: 420000,
      weeks: 1,
    },
    {
      label: 'Свет и сценарии',
      helper: 'подбор светильников и привязка к интерьеру',
      value: 'lighting',
      modes: ['individual'],
      cost: 180000,
      weeks: 1,
    },
    {
      label: 'Авторский надзор',
      helper: 'контроль решений на объекте',
      value: 'supervision',
      modes: ['individual'],
      cost: 160000,
      weeks: 1,
    },
  ],
  notes: [
    'Пакетный формат считает по фиксированной ставке за м² и подходит для быстрого ориентира.',
    'Индивидуальный формат добавляет коэффициенты к площади, отделке и составу работ.',
    'Точная смета всегда уточняется после замера и короткого брифа.',
  ],
  rates: {
    individualDesignPerM2: 9000,
    individualWorkPerM2: {
      basic: 39000,
      standard: 44000,
      premium: 52000,
    },
    propertyCoefficients: {
      new: 1,
      secondary: 1.08,
    },
    complexityCoefficients: {
      simple: 0.94,
      normal: 1,
      complex: 1.12,
    },
    packageMonths: 4,
    individualMonths: {
      basic: 8,
      standard: 10,
      premium: 12,
    },
  },
} as const

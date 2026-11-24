// Owner-supplied project facts; documentary photo correction only.
export type CasePhoto = {
  src: string
  thumbnailSrc?: string
  caption: string
  publicCaption?: string
}
export type CaseStage = { id: string; title: string; description: string; photos: CasePhoto[] }

// Confirmed by the owner on 23 November 2026. Estimated rows are intentionally separate.
export const murinskiyBudget = [
  { title: 'Ремонтные работы', amountRub: 1961103, estimated: false },
  { title: 'Дизайн-проект', amountRub: 206500, estimated: false },
  { title: 'Черновые материалы', amountRub: 1264707, estimated: false },
  { title: 'Чистовые материалы и бытовая техника', amountRub: 1450000, estimated: true },
  { title: 'Мебель', amountRub: 970000, estimated: true },
] as const

export const murinskiyBudgetTotalRub = murinskiyBudget.reduce((sum, row) => sum + row.amountRub, 0)
export const murinskiyBudgetRecordedRub = murinskiyBudget
  .filter((row) => !row.estimated)
  .reduce((sum, row) => sum + row.amountRub, 0)
export const murinskiyBudgetLabel = `Около ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(murinskiyBudgetTotalRub / 1000000)} млн ₽`

export const murinskiyHandover = [
  'Хранение мебели на складе Анфас',
  'Уборка и клининг квартиры',
  'Проверка и подключение всей бытовой техники',
  'Расстановка мебели',
] as const

// Engineering and finishes explicitly confirmed by the owner on 24 November 2026.
export const murinskiySolutions = [
  {
    id: 'finishes',
    title: 'Пол, стены, потолки и двери',
    text: 'На пол уложили кварцвинил, стены подготовили и окрасили. Установили натяжные потолки и двери скрытого монтажа.',
  },
  {
    id: 'windows-and-air',
    title: 'Новые окна и приток свежего воздуха',
    text: 'Заменили окна и установили бризеры для притока свежего воздуха в квартиру.',
  },
  {
    id: 'laundry-drainage',
    title: 'Постирочная с насосом SoloLift',
    text: 'Для отвода воды из постирочной установили насос SoloLift. В гардеробной разместили стиральную и сушильную машины.',
  },
  {
    id: 'ventilation',
    title: 'Вентиляция кухни, санузла и гардеробной',
    text: 'Организовали вентиляцию гардеробной, санузла и кухни. Вентиляторы установили скрыто.',
  },
] as const

export const murinskiyStages: CaseStage[] = [
  {
    id: 'after_demolition',
    title: 'После демонтажа',
    description:
      'После пожара выполнили полный демонтаж. На фото этого этапа — раскрытые кирпичные стены, следы пожара, остатки разобранных конструкций и основание пола.',
    photos: [
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-01.webp',
        caption: 'После демонтажа: остатки каркасов и разобранной отделки.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-02.webp',
        caption: 'Следы пожара и раскрытые конструкции после демонтажа.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-03.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/demolition-original-03.webp',
        caption: 'Остатки разобранных перегородок: вертикальный ракурс.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-07.webp',
        caption: 'Общий вид помещения после демонтажа перегородок.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-04.webp',
        caption: 'Открытое пространство после демонтажа: вид к окнам.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-08.webp',
        caption: 'Помещение после демонтажа: ракурс в сторону входа.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-05.webp',
        caption: 'После демонтажа: кирпичная стена и собранный строительный мусор.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/demolition-original-06.webp',
        caption: 'Существующая сантехника на этапе после демонтажа.',
      },
    ],
  },
  {
    id: 'partition_construction',
    title: 'Новые перегородки',
    description:
      'Основные перегородки возвели из газобетона. В санузлах использовали ПГП-блоки: по условию проекта здесь нужна была минимальная толщина перегородок.',
    photos: [
      {
        src: 'images/projects/2-murinskiy-37/story/partitions-original-01.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/partitions-original-01.webp',
        caption: 'Общий вид новых перегородок и сформированных проёмов.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/partitions-original-02.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/partitions-original-02.webp',
        caption: 'Новая планировка: перегородки и дверные проёмы.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/partitions-original-03.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/partitions-original-03.webp',
        caption: 'Газобетонная перегородка с дверным проёмом.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/partitions-original-04.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/partitions-original-04.webp',
        caption: 'Перегородки санузлов из ПГП-блоков.',
      },
    ],
  },
  {
    id: 'plastering',
    title: 'Штукатурные работы',
    description:
      'Оштукатурили стены и новые перегородки. Фотографии показывают подготовку поверхностей и состояние помещений на этом этапе.',
    photos: [
      {
        src: 'images/projects/2-murinskiy-37/story/plaster-original-01.webp',
        caption: 'Штукатурные работы: подготовка стен и перегородок.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/plaster-original-02.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/plaster-original-02.webp',
        caption: 'Стены и перегородки после оштукатуривания.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/plaster-original-03.webp',
        caption: 'Штукатурные работы в квартире: общий вид этапа.',
      },
    ],
  },
  {
    id: 'floor_screed',
    title: 'Стяжка пола',
    description:
      'Выполнили стяжку пола. На снимках видны новое основание в коридоре и смежных помещениях, а также затирочное оборудование.',
    photos: [
      {
        src: 'images/projects/2-murinskiy-37/story/screed-original-01.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/screed-original-01.webp',
        caption: 'Стяжка пола в коридоре и смежном помещении.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/screed-original-02.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/screed-original-02.webp',
        caption: 'Стяжка пола: на переднем плане затирочная машина.',
      },
    ],
  },
  {
    id: 'electrical_installation',
    title: 'Новая электрика',
    description:
      'Смонтировали новую электрику: щит, кабельные трассы и коробки по потолку. На снимках разводка показана до закрытия конструкций.',
    photos: [
      {
        src: 'images/projects/2-murinskiy-37/story/electrical-original-01.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/electrical-original-01.webp',
        caption: 'Электрощит и отдельный шкаф с кабелями.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/electrical-original-02.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/electrical-original-02.webp',
        caption: 'Кабельные трассы по потолку рядом со щитами.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/electrical-original-03.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/electrical-original-03.webp',
        caption: 'Новая электрика: трассы и коробки до закрытия потолка.',
      },
      {
        src: 'images/projects/2-murinskiy-37/story/electrical-original-04.webp',
        thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/electrical-original-04.webp',
        caption: 'Разводка электрики по потолку: дополнительный ракурс.',
      },
    ],
  },
]
export const resultPhotos: CasePhoto[] = [
  {
    src: 'images/projects/2-murinskiy-37/story/result-36.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-36.webp',
    caption: 'Кухня-гостиная: общий вид готового интерьера.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-38.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-38.webp',
    caption: 'Кухня и обеденная зона у окна.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-23.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-23.webp',
    caption: 'Спальня в готовом интерьере.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-35.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-35.webp',
    caption: 'Комната со спальным местом и встроенным хранением.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-20.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-20.webp',
    caption: 'Ванная комната после отделки.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-39.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-39.webp',
    caption: 'Отдельный санузел.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-27.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-27.webp',
    caption: 'Гардеробная с открытой системой хранения.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/result-28.webp',
    thumbnailSrc: 'images/projects/2-murinskiy-37/story/thumbnails/result-28.webp',
    caption: 'Стиральная и сушильная машины в зоне хранения.',
  },
]
export const planPhotos: CasePhoto[] = [
  {
    src: 'images/projects/2-murinskiy-37/story/plan-measured.webp',
    caption:
      'Обмерный план из РД: раскрытое пространство. Исходная двухкомнатная планировка ещё не подтверждена.',
    publicCaption: 'Обмерный план: раскрытое пространство квартиры.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/plan-design.webp',
    caption:
      'Реализованная планировка из полного дизайн-проекта, лист 3.5. Версия подтверждена владельцем.',
    publicCaption: 'Реализованная планировка с расстановкой мебели.',
  },
  {
    src: 'images/projects/2-murinskiy-37/story/plan-alternative.webp',
    caption:
      'Ранний вариант планировки на согласование. Реализована версия из полного дизайн-проекта.',
  },
]

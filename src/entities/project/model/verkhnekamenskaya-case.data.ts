export type VerkhnekamenskayaPhoto = {
  id: string
  src: string
  thumbnailSrc: string
  caption: string
  width: number
  height: number
  previewRatio: number
}

const photos: VerkhnekamenskayaPhoto[] = [
  {
    id: 'framing-01',
    src: 'images/projects/verkhnekamenskaya/story/stages/framing-01.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/framing-01.webp',
    caption: 'Металлический каркас стен перед обшивкой',
    width: 1200,
    height: 1600,
    previewRatio: 0.75,
  },
  {
    id: 'framing-02',
    src: 'images/projects/verkhnekamenskaya/story/stages/framing-02.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/framing-02.webp',
    caption: 'Закладные и обшивка стен гипсокартоном',
    width: 1200,
    height: 1600,
    previewRatio: 0.75,
  },
  {
    id: 'painting-01',
    src: 'images/projects/verkhnekamenskaya/story/stages/painting-01.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/painting-01.webp',
    caption: 'Подготовка стыков и поверхности ГКЛ',
    width: 1012,
    height: 1800,
    previewRatio: 0.5625,
  },
  {
    id: 'painting-02',
    src: 'images/projects/verkhnekamenskaya/story/stages/painting-02.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/painting-02.webp',
    caption: 'Малярные работы и подготовка стен к окраске',
    width: 1012,
    height: 1800,
    previewRatio: 0.5625,
  },
  {
    id: 'electrical-01',
    src: 'images/projects/verkhnekamenskaya/story/stages/electrical-01.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/electrical-01.webp',
    caption: 'Новая электрика и трековое освещение',
    width: 1012,
    height: 1800,
    previewRatio: 0.5625,
  },
  {
    id: 'electrical-02',
    src: 'images/projects/verkhnekamenskaya/story/stages/electrical-02.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/electrical-02.webp',
    caption: 'Смонтированное освещение со стороны зала',
    width: 1012,
    height: 1800,
    previewRatio: 0.5625,
  },
  {
    id: 'epoxy-base-01',
    src: 'images/projects/verkhnekamenskaya/story/stages/epoxy-base-01.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/epoxy-base-01.webp',
    caption: 'Основание под эпоксидный пол у входа',
    width: 1056,
    height: 1408,
    previewRatio: 0.75,
  },
  {
    id: 'epoxy-base-02',
    src: 'images/projects/verkhnekamenskaya/story/stages/epoxy-base-02.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/epoxy-base-02.webp',
    caption: 'Подготовленный пол в глубине помещения',
    width: 1056,
    height: 1408,
    previewRatio: 0.75,
  },
  {
    id: 'cafe-hall',
    src: 'images/projects/verkhnekamenskaya/story/finished/cafe-hall.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/cafe-hall.webp',
    caption: 'Общий вид кофейни: зал, стойка и освещение',
    width: 1200,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'window-seating',
    src: 'images/projects/verkhnekamenskaya/story/finished/window-seating.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/window-seating.webp',
    caption: 'Посадочные места и барная стойка у окна',
    width: 1228,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'coffee-table',
    src: 'images/projects/verkhnekamenskaya/story/finished/coffee-table.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/coffee-table.webp',
    caption: 'Столик у панорамного окна в готовом интерьере',
    width: 1200,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'counter',
    src: 'images/projects/verkhnekamenskaya/story/finished/counter.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/counter.webp',
    caption: 'Стойка кофейни с подсветкой и эпоксидный пол',
    width: 1200,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'lighting',
    src: 'images/projects/verkhnekamenskaya/story/finished/lighting.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/lighting.webp',
    caption: 'Трековое и декоративное освещение кофейни',
    width: 1250,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'bathroom',
    src: 'images/projects/verkhnekamenskaya/story/finished/bathroom.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/bathroom.webp',
    caption: 'Санузел с плиткой, зеркалом и подвесной столешницей',
    width: 1200,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'seating-in-use',
    src: 'images/projects/verkhnekamenskaya/story/finished/seating-in-use.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/seating-in-use.webp',
    caption: 'Готовый зал кофейни с посадочными местами у окна',
    width: 1200,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
  {
    id: 'entrance-floor',
    src: 'images/projects/verkhnekamenskaya/story/finished/entrance-floor.webp',
    thumbnailSrc: 'images/projects/verkhnekamenskaya/story/thumbnails/entrance-floor.webp',
    caption: 'Входная зона и эпоксидный пол в готовом помещении',
    width: 1189,
    height: 1800,
    previewRatio: 0.6666666666666666,
  },
]

export const verkhnekamenskayaStagePhotos = photos.slice(0, 8)
export const verkhnekamenskayaPhotos = photos.slice(8)
export const verkhnekamenskayaCover =
  'images/projects/verkhnekamenskaya/story/finished/cover-cafe-hall.webp'
export const verkhnekamenskayaShareImage =
  'images/projects/verkhnekamenskaya/story/share/cafe-hall-1200x630.jpg'
export const verkhnekamenskayaMedia = [...verkhnekamenskayaPhotos, ...verkhnekamenskayaStagePhotos]
export const verkhnekamenskayaStages = [
  {
    title: 'Каркасные стены, закладные и ГКЛ',
    description:
      'Собрали металлический каркас стен, предусмотрели закладные и выполнили обшивку гипсокартоном.',
    photos: verkhnekamenskayaStagePhotos.slice(0, 2),
  },
  {
    title: 'Малярные работы',
    description:
      'Подготовили поверхности и стыки гипсокартона под окраску. На фотографиях — стены в процессе малярных работ.',
    photos: verkhnekamenskayaStagePhotos.slice(2, 4),
  },
  {
    title: 'Новая электрика и освещение',
    description:
      'Выполнили новую разводку электрики и смонтировали трековое освещение. Трассы по потолку и установленные светильники показаны до завершения отделки.',
    photos: verkhnekamenskayaStagePhotos.slice(4, 6),
  },
  {
    title: 'Подготовка под эпоксидный пол',
    description:
      'Подготовили основание под наливной эпоксидный пол. Готовое покрытие показано в фотографиях результата.',
    photos: verkhnekamenskayaStagePhotos.slice(6, 8),
  },
]
export const verkhnekamenskayaBudget = [
  { title: 'Ремонтные работы', amountRub: 1121980 - 47000 + 15750 },
  { title: 'Работы сторонних подрядчиков', amountRub: 45000 },
  { title: 'Вывоз мусора', amountRub: 47000 },
  { title: 'Материалы', amountRub: 754682 },
] as const
export const verkhnekamenskayaBudgetTotal = verkhnekamenskayaBudget.reduce(
  (sum, row) => sum + row.amountRub,
  0,
)
export const verkhnekamenskayaBudgetLabel = '1 937 412 ₽'

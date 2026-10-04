import type {
  WallDemolitionCoveringOption,
  WallFinishTargetOption,
  WallPaintLayersOption,
  WallSubstrateOption,
  WallLevelingOption,
  WallMoistureOption,
  WallQualityOption,
  WallBaseConditionOption,
  WallSlopesWorkOption,
  WallStateOption,
  WallWallpaperTypeOption,
} from '@/entities/estimate'

/** Тексты и варианты вопросов пилотного маршрута стен. Состав работ живёт в apply-wall-scenario.ts. */
export const WALL_STATE_OPTIONS: ReadonlyArray<{ value: WallStateOption; label: string }> = [
  { value: 'from-scratch', label: 'С нуля — подготовить основание' },
  { value: 'after-demolition', label: 'Демонтаж уже выполнен' },
  { value: 'prefinish', label: 'Стены уже оштукатурены' },
  { value: 'local-leveling', label: 'Только локально выровнять' },
  { value: 'demolition-only', label: 'Только снять старое покрытие' },
  { value: 'finish-only', label: 'Основание готово — только финиш' },
]

export const WALL_FINISH_OPTIONS: ReadonlyArray<{ value: WallFinishTargetOption; label: string }> = [
  { value: 'none', label: 'Без финиша' },
  { value: 'wallpaper', label: 'Под обои' },
  { value: 'paint', label: 'Под покраску' },
]

export const WALL_DEMOLITION_OPTIONS: ReadonlyArray<{ value: WallDemolitionCoveringOption; label: string }> = [
  { value: 'wallpaper', label: 'Обои' },
  { value: 'paint', label: 'Краска' },
  { value: 'plaster', label: 'Штукатурка' },
  { value: 'wall-tile', label: 'Плитка стеновая' },
  { value: 'glassfiber', label: 'Стеклохолст' },
]

export const WALL_WALLPAPER_OPTIONS: ReadonlyArray<{ value: WallWallpaperTypeOption; label: string }> = [
  { value: 'flizelin', label: 'Флизелин без подбора' },
  { value: 'vinyl-match', label: 'Винил с подбором' },
  { value: 'photo', label: 'Фотообои' },
  { value: 'textile-match', label: 'Тканевые с подбором' },
]

export const WALL_SLOPES_OPTIONS: ReadonlyArray<{ value: WallSlopesWorkOption; label: string }> = [
  { value: 'none', label: 'Не добавлять' },
  { value: 'putty-paint', label: 'Шпаклёвка, шлифовка и покраска' },
  { value: 'sandwich', label: 'Монтаж сэндвич-панелей' },
]

export const WALL_PAINT_OPTIONS: ReadonlyArray<{ value: WallPaintLayersOption; label: string }> = [
  { value: 'paint-2', label: 'Валик, 2 слоя' },
  { value: 'paint-1', label: 'Валик, 1 слой' },
  { value: 'paint-3', label: 'Валик, 3 слоя' },
  { value: 'paint-mech-2', label: 'Механизированная, 2 слоя' },
]

export const WALL_SUBSTRATE_OPTIONS: ReadonlyArray<{ value: WallSubstrateOption; label: string }> = [
  { value: 'unknown', label: 'Пока не знаю — нужно осмотреть' },
  { value: 'absorbent', label: 'Минеральное основание: кирпич, блок или бетон' },
  { value: 'plastered', label: 'Существующая прочная штукатурка' },
  { value: 'drywall', label: 'Гипсокартон' },
]

export const WALL_LEVELING_OPTIONS: ReadonlyArray<{ value: WallLevelingOption; label: string }> = [
  { value: 'full', label: 'Нужно выровнять всю стену' },
  { value: 'local', label: 'Только отдельные неровности' },
  { value: 'none', label: 'Плоскость уже ровная' },
]

export const WALL_MOISTURE_OPTIONS: ReadonlyArray<{ value: WallMoistureOption; label: string }> = [
  { value: 'normal', label: 'Обычное сухое помещение' },
  { value: 'wet', label: 'Зона прямого увлажнения' },
]

export const WALL_QUALITY_OPTIONS: ReadonlyArray<{ value: WallQualityOption; label: string }> = [
  { value: 'q2', label: 'Q2 · фактурные обои, без гладкой покраски' },
  { value: 'q3', label: 'Q3 · тонкие обои или матовая краска' },
  { value: 'q4', label: 'Q4 · глянцевая отделка, уточнить технологию' },
]

export const WALL_BASE_CONDITION_OPTIONS: ReadonlyArray<{ value: WallBaseConditionOption; label: string }> = [
  { value: 'unknown', label: 'Ещё не проверил прочность' },
  { value: 'sound', label: 'Прочное, нет отслоений и сырости' },
  { value: 'loose', label: 'Есть отслоения, рыхлые участки или сырость' },
]

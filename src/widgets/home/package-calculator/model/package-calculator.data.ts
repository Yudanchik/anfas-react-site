export const packageCalculator = {
  eyebrow: '05 • Мини-калькулятор',
  title: 'Ориентир по стоимости пакетного ремонта',
  lead: 'Считаем примерный бюджет и срок по параметрам квартиры. Это не финальная смета, а удобная отправная точка для выбора пакета.',
  areaOptions: [
    { label: '35 м²', value: 35 },
    { label: '45 м²', value: 45 },
    { label: '60 м²', value: 60 },
    { label: '80 м²', value: 80 },
    { label: '100 м²', value: 100 },
  ],
  roomTypes: [
    { label: 'Студия', value: 'studio' },
    { label: '1-комнатная', value: 'one' },
    { label: '2-комнатная', value: 'two' },
    { label: '3-комнатная', value: 'three' },
  ],
  levels: [
    { label: 'Базовый', value: 'basic' },
    { label: 'Стандарт', value: 'standard' },
    { label: 'Премиум', value: 'premium' },
  ],
  options: [
    { label: 'Нужна мебель', value: 'furniture' },
    { label: 'Нужна техника', value: 'appliances' },
    { label: 'Нужен дизайн-пакет', value: 'design' },
  ],
  notes: [
    'Чем больше площадь, тем выше ориентир по бюджету и сроку.',
    'Пакет можно уточнить после короткой консультации и брифа.',
    'Дополнительные опции влияют на финальный расчёт и сроки.',
  ],
} as const

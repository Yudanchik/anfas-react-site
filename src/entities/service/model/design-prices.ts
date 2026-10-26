export const designPrices = [
  { id: 'technical', title: 'Технический проект', price: 2500 },
  { id: 'design', title: 'Дизайн-проект', price: 3500 },
  { id: 'premium', title: 'Премиум-проект', price: 4500 },
] as const

export function formatDesignPrice(price: number) {
  return `${price.toLocaleString('ru-RU')} ₽ / м²`
}

export const designPriceRange = `${Math.min(...designPrices.map((rate) => rate.price)).toLocaleString('ru-RU')}–${formatDesignPrice(Math.max(...designPrices.map((rate) => rate.price)))}`

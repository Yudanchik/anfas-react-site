import type { Article } from '../model/article.types'

function hashSeed(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash || 1
}

function seededShuffle<T>(items: readonly T[], seed: string) {
  const result = [...items]
  let state = hashSeed(seed)

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

export function getSuggestedArticles(
  articles: readonly Article[],
  currentSlug: string,
  limit = 4,
) {
  const candidates = articles.filter((article) => article.slug !== currentSlug)
  return seededShuffle(candidates, currentSlug).slice(0, limit)
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

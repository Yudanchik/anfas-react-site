import { articles, type Article } from '@/entities/article/model'

import type { ArticleRepository } from './article.repository'

export const localArticleRepository: ArticleRepository = {
  async getAll(): Promise<readonly Article[]> {
    return articles
  },

  async getBySlug(slug: string): Promise<Article | null> {
    return articles.find((article) => article.slug === slug) ?? null
  },
}

import type { Article } from '@/entities/article/model/article.types'
import articlesSnapshot from '@/shared/content/articles/articles.snapshot.json'

import type { ArticleRepository } from './article.repository'

const snapshotArticles = articlesSnapshot as Article[]

export const snapshotArticleRepository: ArticleRepository = {
  async getAll(): Promise<readonly Article[]> {
    return snapshotArticles
  },

  async getBySlug(slug: string): Promise<Article | null> {
    return snapshotArticles.find((article) => article.slug === slug) ?? null
  },
}

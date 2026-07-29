import type { Article } from '../model/article.types'

export interface ArticleRepository {
  getAll(): Promise<readonly Article[]>
  getBySlug(slug: string): Promise<Article | null>
}

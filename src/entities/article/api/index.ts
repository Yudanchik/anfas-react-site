import { getContentSource } from '@/shared/content/content-source'

import type { ArticleRepository } from './article.repository'
import { localArticleRepository } from './local-article.repository'
import { snapshotArticleRepository } from './snapshot-article.repository'
import { strapiArticleRepository } from './strapi-article.repository'

function createArticleRepository(): ArticleRepository {
  const source = getContentSource()
  if (source === 'strapi') {
    return strapiArticleRepository
  }
  if (source === 'snapshot') {
    return snapshotArticleRepository
  }
  return localArticleRepository
}

export const articleRepository = createArticleRepository()

export type { ArticleRepository }

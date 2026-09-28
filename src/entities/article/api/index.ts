import { localArticleRepository } from './local-article.repository'
import { strapiArticleRepository } from './strapi-article.repository'

export const articleRepository =
  import.meta.env.VITE_CONTENT_SOURCE === 'strapi'
    ? strapiArticleRepository
    : localArticleRepository

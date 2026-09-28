import { z } from 'zod'

const categorySlugSchema = z.enum(['inzheneriya', 'chernovye-raboty', 'komplektaciya'])

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
})

const sectionSchema = z.object({
  sectionId: z.string(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
  list: z.array(z.string()).nullable().optional(),
})

const ctaSchema = z.object({
  title: z.string(),
  text: z.string(),
  href: z.string(),
})

const mediaSchema = z
  .object({
    url: z.string().optional(),
    alternativeText: z.string().nullable().optional(),
  })
  .passthrough()
  .nullable()
  .optional()

const categorySchema = z
  .object({
    name: z.string(),
    slug: categorySlugSchema,
  })
  .passthrough()

const relatedArticleSchema = z
  .object({
    slug: z.string(),
  })
  .passthrough()

export const strapiArticleDtoSchema = z
  .object({
    documentId: z.string().optional(),
    slug: z.string(),
    title: z.string(),
    titleAccent: z.string(),
    eyebrow: z.string(),
    lead: z.string(),
    coverPath: z.string(),
    coverAlt: z.string(),
    cover: mediaSchema,
    publishedAtDate: z.string(),
    readTime: z.string(),
    category: categorySchema.nullable().optional(),
    seo: seoSchema,
    sections: z.array(sectionSchema),
    checklist: z.array(z.string()),
    mistakes: z.array(z.string()),
    cta: ctaSchema,
    relatedArticles: z.array(relatedArticleSchema).nullable().optional(),
    relatedService: z.enum(['package', 'individual']),
  })
  .passthrough()

export const strapiArticlesResponseSchema = z.object({
  data: z.array(strapiArticleDtoSchema),
})

export type StrapiArticleDto = z.infer<typeof strapiArticleDtoSchema>

import { z } from 'zod'

const seoSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
  })
  .passthrough()

const positionSchema = z
  .object({
    name: z.string(),
    unit: z.string(),
    priceFrom: z.number().int().nonnegative(),
    note: z.string().nullable().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .passthrough()

const factorSchema = z
  .object({
    title: z.string(),
    text: z.string(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .passthrough()

const faqItemSchema = z
  .object({
    question: z.string(),
    answer: z.string(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .passthrough()

export const strapiPriceCategoryDtoSchema = z
  .object({
    documentId: z.string().optional(),
    title: z.string(),
    slug: z.string(),
    titleAccent: z.string(),
    eyebrow: z.string(),
    lead: z.string(),
    priceFrom: z.number().int().nonnegative(),
    priceUnit: z.string(),
    disclaimer: z.string(),
    serviceSlug: z.enum(['individual', 'package']).nullable().optional(),
    relatedArticleSlugs: z.array(z.string()).nullable().optional(),
    relatedCategorySlugs: z.array(z.string()).nullable().optional(),
    sortOrder: z.number().int().nonnegative(),
    positions: z.array(positionSchema),
    factors: z.array(factorSchema),
    faq: z.array(faqItemSchema),
    seo: seoSchema,
  })
  .passthrough()

export const strapiPriceCategoriesResponseSchema = z.object({
  data: z.array(strapiPriceCategoryDtoSchema),
})

export type StrapiPriceCategoryDto = z.infer<typeof strapiPriceCategoryDtoSchema>

import { z } from 'zod'

const mediaSchema = z
  .object({
    url: z.string().optional(),
    alternativeText: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
  })
  .passthrough()
  .nullable()
  .optional()

const galleryItemSchema = z
  .object({
    imagePath: z.string(),
    sortOrder: z.number().int().nonnegative(),
    alt: z.string().nullable().optional(),
    image: mediaSchema,
  })
  .passthrough()

const reviewSchema = z
  .object({
    quote: z.string(),
    details: z.string().nullable().optional(),
    author: z.string(),
    projectInfo: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    service: z.string().nullable().optional(),
  })
  .passthrough()

const seoSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
  })
  .passthrough()
  .nullable()
  .optional()

export const strapiProjectDtoSchema = z
  .object({
    documentId: z.string().optional(),
    slug: z.string(),
    title: z.string(),
    type: z.string(),
    typeAccent: z.string(),
    location: z.string(),
    description: z.string(),
    imagePath: z.string(),
    image: mediaSchema,
    area: z.string(),
    term: z.string(),
    price: z.string(),
    size: z.enum(['wide', 'tall', 'standard']),
    gallery: z.array(galleryItemSchema),
    details: z.array(z.string()),
    review: reviewSchema.nullable().optional(),
    seo: seoSchema,
  })
  .passthrough()

export const strapiProjectsResponseSchema = z.object({
  data: z.array(strapiProjectDtoSchema),
})

export type StrapiProjectDto = z.infer<typeof strapiProjectDtoSchema>

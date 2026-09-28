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

const statSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .passthrough()

const seoSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
  })
  .passthrough()

const heroSchema = z
  .object({
    eyebrow: z.string(),
    titleLine: z.string(),
    titleAccent: z.string(),
    lead: z.string(),
    stats: z.array(statSchema),
    aside: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        text: z.string(),
      })
      .passthrough(),
  })
  .passthrough()

const includedSchema = z
  .object({
    label: z.string(),
    titleMain: z.string(),
    titleAccent: z.string(),
    lead: z.string(),
    groups: z.array(
      z
        .object({
          number: z.string(),
          title: z.string(),
          text: z.string(),
          items: z.array(z.string()),
        })
        .passthrough(),
    ),
    fit: z
      .object({
        label: z.string(),
        title: z.string(),
        text: z.string(),
        points: z.array(z.string()),
      })
      .passthrough(),
    note: z.string(),
  })
  .passthrough()

const storyCardSchema = z
  .object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
  })
  .passthrough()

const storyIndividualSchema = z
  .object({
    eyebrow: z.string(),
    title: z.string(),
    lead: z.string(),
    hero: z
      .object({
        overline: z.string(),
        title: z.string(),
        text: z.string(),
        metrics: z.array(statSchema),
      })
      .passthrough(),
    highlights: z.array(storyCardSchema),
    steps: z.array(storyCardSchema),
  })
  .passthrough()

const storyPackageSchema = z
  .object({
    eyebrow: z.string(),
    title: z.string(),
    lead: z.string(),
    summary: z
      .object({
        overline: z.string(),
        title: z.string(),
        text: z.string(),
        bullets: z.array(z.string()),
      })
      .passthrough(),
    steps: z.array(
      z
        .object({
          number: z.string(),
          title: z.string(),
          text: z.string(),
          meta: z.string(),
        })
        .passthrough(),
    ),
  })
  .passthrough()

export const strapiServiceDtoSchema = z
  .object({
    documentId: z.string().optional(),
    title: z.string(),
    slug: z.string(),
    serviceId: z.enum(['individual', 'package']),
    number: z.string(),
    shortText: z.string(),
    text: z.string(),
    lead: z.string(),
    tags: z.array(z.string()),
    imagePath: z.string(),
    cover: mediaSchema,
    imageWidth: z.number().int().optional().nullable(),
    imageHeight: z.number().int().optional().nullable(),
    bullets: z.array(z.string()),
    metrics: z.array(statSchema),
    price: z.string(),
    duration: z.string(),
    ctaLabel: z.string(),
    sortOrder: z.number().int().nonnegative(),
    hero: heroSchema,
    included: includedSchema,
    storyIndividual: storyIndividualSchema.nullable().optional(),
    storyPackage: storyPackageSchema.nullable().optional(),
    seo: seoSchema,
  })
  .passthrough()

export const strapiServicesResponseSchema = z.object({
  data: z.array(strapiServiceDtoSchema),
})

export type StrapiServiceDto = z.infer<typeof strapiServiceDtoSchema>

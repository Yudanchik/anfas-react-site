import { z } from 'zod'

const faqItemSchema = z
  .object({
    question: z.string(),
    answer: z.string(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .passthrough()

export const strapiFaqGroupDtoSchema = z
  .object({
    documentId: z.string().optional(),
    key: z.enum(['home', 'prices-hub']),
    sortOrder: z.number().int().nonnegative(),
    items: z.array(faqItemSchema),
  })
  .passthrough()

export const strapiFaqGroupsResponseSchema = z.object({
  data: z.array(strapiFaqGroupDtoSchema),
})

export type StrapiFaqGroupDto = z.infer<typeof strapiFaqGroupDtoSchema>

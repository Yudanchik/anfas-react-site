import { z } from 'zod'

export const briefSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя'),
  phone: z
    .string()
    .trim()
    .min(10, 'Укажите телефон')
    .regex(/^[+\d\s()-]+$/, 'Проверьте формат телефона'),
  service: z.enum(['design', 'renovation', 'full'], {
    error: 'Выберите услугу',
  }),
})

export type BriefFormValues = z.infer<typeof briefSchema>

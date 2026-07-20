import { z } from 'zod'
import { normalizePhoneDigits } from './brief.form'

export const briefSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Укажите имя')
    .regex(/^[A-Za-zА-Яа-яЁё\s-]+$/, 'Введите имя без цифр и спецсимволов'),
  phone: z
    .string()
    .trim()
    .min(1, 'Укажите телефон')
    .refine((value) => normalizePhoneDigits(value).length === 11, 'Введите телефон полностью'),
  service: z.enum(['general', 'individual', 'package'], {
    error: 'Выберите услугу',
  }),
  wishes: z.string().trim().max(600, 'Сократите текст до 600 символов').optional(),
})

export type BriefFormValues = z.infer<typeof briefSchema>

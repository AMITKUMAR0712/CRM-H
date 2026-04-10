import { z } from 'zod'

export const smartCategoryCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

export const smartCategoryUpdateSchema = smartCategoryCreateSchema.partial()

export const smartCategoryQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  search: z.string().optional(),
  includeInactive: z.string().optional(),
})

export type SmartCategoryCreateInput = z.infer<typeof smartCategoryCreateSchema>
export type SmartCategoryUpdateInput = z.infer<typeof smartCategoryUpdateSchema>

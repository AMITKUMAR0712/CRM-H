import { z } from 'zod'

const menuVisibilityEnum = z.enum(['HEADER', 'FOOTER', 'BOTH'])
const menuItemTypeEnum = z.enum(['PAGE', 'URL'])

const menuItemBaseSchema = z.object({
  title: z.string().min(1).max(80),
  type: menuItemTypeEnum.default('URL'),
  href: z.string().min(1).max(2048).optional(),
  pageId: z.string().min(1).optional(),
  parentId: z.string().min(1).optional().nullable(),
  order: z.number().int().min(0).optional(),
  visibility: menuVisibilityEnum.default('HEADER'),
  isActive: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
})

export const menuItemCreateSchema = menuItemBaseSchema.superRefine((val, ctx) => {
  if (val.type === 'URL') {
    if (!val.href) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'href is required when type is URL', path: ['href'] })
    }
  }

  if (val.type === 'PAGE') {
    if (!val.pageId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'pageId is required when type is PAGE', path: ['pageId'] })
    }
  }
})

export const menuItemUpdateSchema = menuItemBaseSchema
  .partial()
  .extend({
    title: z.string().min(1).max(80).optional(),
    type: menuItemTypeEnum.optional(),
    visibility: menuVisibilityEnum.optional(),
  })
  .superRefine((val, ctx) => {
    // Zod v4 note: partial() can't be used on refined schemas.
    // For updates, only enforce required fields when switching types.
    if (val.type === 'URL') {
      if (!val.href) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'href is required when type is URL', path: ['href'] })
      }
    }

    if (val.type === 'PAGE') {
      if (!val.pageId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'pageId is required when type is PAGE', path: ['pageId'] })
      }
    }
  })

export const menuItemReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        parentId: z.string().min(1).nullable().optional(),
        order: z.number().int().min(0),
      })
    )
    .min(1),
})

export const menuItemQuerySchema = z.object({
  visibility: menuVisibilityEnum.optional(),
  includeInactive: z.enum(['true', 'false']).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
})

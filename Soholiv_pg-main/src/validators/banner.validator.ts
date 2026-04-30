import { z } from 'zod'
import { BannerType, DiscountType, BannerTargetScope, BannerEventType } from '@prisma/client'

export const bannerTargetSchema = z.object({
  scope: z.nativeEnum(BannerTargetScope),
  sectorId: z.string().cuid().optional().nullable(),
  pgId: z.string().cuid().optional().nullable(),
})

export const bannerCreateSchema = z.object({
  type: z.nativeEnum(BannerType),
  title: z.string().min(3).max(120),
  subtitle: z.string().max(255).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  ctaLabel: z.string().max(60).optional().nullable(),
  ctaHref: z.string().max(2000).optional().nullable(),

  discountType: z.nativeEnum(DiscountType).optional().nullable(),
  discountValue: z.number().int().min(1).optional().nullable(),

  validFrom: z.string().datetime().optional().nullable(),
  validTill: z.string().datetime().optional().nullable(),

  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(9999).optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),

  targets: z.array(bannerTargetSchema).min(1),
})

export const bannerUpdateSchema = bannerCreateSchema.partial().extend({
  targets: z.array(bannerTargetSchema).optional(),
})

export const bannerQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  type: z.nativeEnum(BannerType).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
})

export const bannerPublicQuerySchema = z.object({
  scope: z.nativeEnum(BannerTargetScope),
  sectorId: z.string().cuid().optional(),
  pgId: z.string().cuid().optional(),
})

export const bannerEventCreateSchema = z.object({
  bannerId: z.string().cuid(),
  type: z.nativeEnum(BannerEventType),
  path: z.string().max(255).optional(),
  sessionId: z.string().max(64).optional(),
  metadata: z.unknown().optional(),
})

export type BannerCreateInput = z.infer<typeof bannerCreateSchema>
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>

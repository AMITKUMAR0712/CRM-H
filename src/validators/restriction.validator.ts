import { z } from 'zod'
import { RestrictionType } from '@prisma/client'

export const restrictionCreateSchema = z.object({
  type: z.nativeEnum(RestrictionType),
  reason: z.string().max(4000).optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
})

export const restrictionRevokeSchema = z.object({
  revokedReason: z.string().max(4000).optional().nullable(),
})

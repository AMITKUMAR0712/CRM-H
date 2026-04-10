import { z } from 'zod'
import { ChatThreadStatus } from '@prisma/client'

export const chatThreadCreateSchema = z.object({
  pgId: z.string().cuid().optional().nullable(),
})

export const chatMessageCreateSchema = z.object({
  body: z.string().min(1).max(8000),
})

export const chatThreadUpdateSchema = z.object({
  status: z.nativeEnum(ChatThreadStatus).optional(),
  mutedUntil: z.string().datetime().nullable().optional(),
})

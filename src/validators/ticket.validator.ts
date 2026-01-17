import { z } from 'zod'
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client'

export const ticketCreateSchema = z.object({
  pgId: z.string().cuid().optional().nullable(),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority).optional(),
  subject: z.string().min(3).max(255),
  description: z.string().min(5).max(4000),
})

export const ticketUpdateSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  assignedToId: z.string().cuid().nullable().optional(),
  slaDueAt: z.string().datetime().nullable().optional(),
})

export const ticketMessageCreateSchema = z.object({
  body: z.string().min(1).max(8000),
  isInternal: z.boolean().optional(),
  attachments: z.array(
    z.object({
      url: z.string().url(),
      mimeType: z.string().max(120).optional(),
      sizeBytes: z.number().int().optional(),
    })
  ).optional(),
})

export const ticketQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  assignedToId: z.string().cuid().optional(),
  search: z.string().optional(),
})

import { z } from 'zod'
import { EnquiryStatus, EnquiryType } from '@prisma/client'

const phoneRegex = /^\+?[0-9\-\s]{7,20}$/

export const enquiryCreateSchema = z.object({
  type: z.nativeEnum(EnquiryType).optional(),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
  subject: z.string().max(255).optional().or(z.literal('')),
  message: z.string().min(5).max(4000),
  pgId: z.string().cuid().optional(),
  sectorId: z.string().cuid().optional(),

  hasConsent: z.boolean().optional(),

  source: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export const enquiryUpdateSchema = z.object({
  status: z.nativeEnum(EnquiryStatus).optional(),
  assignedToId: z.string().cuid().nullable().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  closedAt: z.string().datetime().nullable().optional(),
})

export const enquiryNoteCreateSchema = z.object({
  body: z.string().min(1).max(4000),
  isInternal: z.boolean().optional().default(true),
})

export const enquiryQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  status: z.nativeEnum(EnquiryStatus).optional(),
  type: z.nativeEnum(EnquiryType).optional(),
  assignedToId: z.string().cuid().optional(),
  pgId: z.string().cuid().optional(),
  sectorId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
})

export const enquiryUserQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.nativeEnum(EnquiryStatus).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
})

import { z } from 'zod'
import { RoomType, OccupancyType, LeadStatus, Priority } from '@prisma/client'

// ============================================
// LEAD VALIDATORS
// ============================================

// Phone regex - supports Indian and international formats
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/

export const leadCreateSchema = z.object({
    // User Info
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
    email: z.string().email('Please enter a valid email').optional().or(z.literal('')),

    // Preferences
    preferredSectorId: z.string().cuid().optional(),
    budgetMin: z.number().min(0).optional(),
    budgetMax: z.number().min(0).optional(),
    roomType: z.nativeEnum(RoomType).optional(),
    occupancyType: z.nativeEnum(OccupancyType).optional(),
    moveInDate: z.string().datetime().optional().or(z.string().optional()),

    // Visit Request
    visitSlot: z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
    message: z.string().max(1000).optional(),

    // Source Tracking
    source: z.string().default('website'),
    referrer: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),

    // Related PG
    pgId: z.string().cuid().optional(),

    // Consent
    hasConsent: z.boolean().refine(val => val === true, {
        message: 'You must agree to our terms and privacy policy',
    }),
})

export const leadUpdateSchema = z.object({
    status: z.nativeEnum(LeadStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    notes: z.string().optional(),
    followUpDate: z.string().datetime().optional(),
    assignedToId: z.string().cuid().optional(),
})

export const leadQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    status: z.nativeEnum(LeadStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    sectorId: z.string().cuid().optional(),
    pgId: z.string().cuid().optional(),
    assignedToId: z.string().cuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'name', 'status', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type LeadCreateInput = z.infer<typeof leadCreateSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type LeadQueryParams = z.infer<typeof leadQuerySchema>

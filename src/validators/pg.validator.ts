import { z } from 'zod'
import { RoomType, OccupancyType, PGApprovalStatus } from '@prisma/client'

// ============================================
// PG VALIDATORS
// ============================================

export const pgCreateSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
    sectorId: z.string().cuid('Invalid sector ID'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    description: z.string().optional(),

    // Room & Pricing
    roomType: z.nativeEnum(RoomType),
    occupancyType: z.nativeEnum(OccupancyType),
    monthlyRent: z.number().min(1000, 'Minimum rent is ₹1000').max(100000),
    securityDeposit: z.number().min(0).optional(),

    // Availability
    totalRooms: z.number().min(1, 'Must have at least 1 room'),
    availableRooms: z.number().min(0),
    isAvailable: z.boolean().default(true),

    // Amenities
    hasAC: z.boolean().default(false),
    hasWifi: z.boolean().default(true),
    hasParking: z.boolean().default(false),
    hasGym: z.boolean().default(false),
    hasPowerBackup: z.boolean().default(true),
    hasLaundry: z.boolean().default(false),
    hasTV: z.boolean().default(false),
    hasFridge: z.boolean().default(false),

    // Meals
    mealsIncluded: z.boolean().default(false),
    mealsPerDay: z.number().min(0).max(3).optional(),

    // Policies
    gateClosingTime: z.string().optional(),
    noticePeriod: z.number().min(0).max(90).optional(),

    // SEO
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),

    // Status
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    approvalStatus: z.nativeEnum(PGApprovalStatus).optional(),
    blockedReason: z.string().max(2000).optional(),

    // Smart Finder
    categoryIds: z.array(z.string().cuid()).optional(),
    assignedManagerIds: z.array(z.string().cuid()).optional(),
})

export const pgUpdateSchema = pgCreateSchema.partial()

export const pgQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    sector: z.string().optional(),
    category: z.string().optional(),
    approvalStatus: z.nativeEnum(PGApprovalStatus).optional(),
    roomType: z.nativeEnum(RoomType).optional(),
    occupancyType: z.nativeEnum(OccupancyType).optional(),
    minRent: z.string().optional(),
    maxRent: z.string().optional(),
    hasAC: z.string().optional(),
    hasWifi: z.string().optional(),
    hasParking: z.string().optional(),
    hasGym: z.string().optional(),
    hasPowerBackup: z.string().optional(),
    hasLaundry: z.string().optional(),
    hasTV: z.string().optional(),
    hasFridge: z.string().optional(),
    mealsIncluded: z.string().optional(),
    isFeatured: z.string().optional(),
    isActive: z.string().optional(),
    search: z.string().optional(),
    metroDistance: z.string().optional(),
    sortBy: z.enum(['createdAt', 'monthlyRent', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type PGCreateInput = z.infer<typeof pgCreateSchema>
export type PGUpdateInput = z.infer<typeof pgUpdateSchema>
export type PGQueryParams = z.infer<typeof pgQuerySchema>

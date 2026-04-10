import { z } from 'zod'

// ============================================
// SECTOR VALIDATORS
// ============================================

export const sectorCreateSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
    description: z.string().optional(),
    metroStation: z.string().optional(),
    metroDistance: z.number().min(0).optional(),
    highlights: z.array(z.string()).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isActive: z.boolean().default(true),
})

export const sectorUpdateSchema = sectorCreateSchema.partial()

// ============================================
// FAQ VALIDATORS
// ============================================

export const faqCreateSchema = z.object({
    question: z.string().min(10, 'Question must be at least 10 characters'),
    answer: z.string().min(20, 'Answer must be at least 20 characters'),
    category: z.string().optional(),
    sectorId: z.string().cuid().optional(),
    order: z.number().min(0).default(0),
    isActive: z.boolean().default(true),
})

export const faqUpdateSchema = faqCreateSchema.partial()

// ============================================
// REVIEW VALIDATORS
// ============================================

export const reviewCreateSchema = z.object({
    pgId: z.string().cuid().optional(),
    name: z.string().min(2).max(100),
    occupation: z.string().max(100).optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
    photo: z.string().url().optional(),
})

export const reviewUpdateSchema = z.object({
    isVerified: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isApproved: z.boolean().optional(),
})

// ============================================
// GALLERY VALIDATORS
// ============================================

export const galleryImageCreateSchema = z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().max(255).optional(),
    caption: z.string().max(255).optional(),
    album: z.enum(['rooms', 'common', 'food', 'neighborhood', 'safety', 'exterior']),
    sectorSlug: z.string().optional(),
    pgId: z.string().cuid().optional(),
    roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING']).optional(),
    floor: z.number().int().min(0).optional(),
    availability: z.string().max(60).optional(),
    displayOrder: z.number().min(0).default(0),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
})

export const galleryImageUpdateSchema = galleryImageCreateSchema.partial()

export const galleryQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    album: z.string().optional(),
    sectorSlug: z.string().optional(),
    pgId: z.string().optional(),
    roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING']).optional(),
    availability: z.string().optional(),
    isFeatured: z.string().optional(),
    includeInactive: z.string().optional(),
})

// ============================================
// COMPARISON VALIDATORS
// ============================================

export const comparisonCreateSchema = z.object({
    pgIds: z.array(z.string().cuid()).min(2, 'Select at least 2 PGs to compare').max(4, 'Maximum 4 PGs allowed'),
    sessionId: z.string().optional(),
})

// ============================================
// SETTINGS VALIDATORS
// ============================================

export const settingUpdateSchema = z.object({
    value: z.string(),
})

// ============================================
// CONTACT FORM VALIDATOR
// ============================================

export const contactFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Please enter a valid phone number'),
    email: z.string().email().optional().or(z.literal('')),
    preferredSectorId: z.string().optional(),
    budgetRange: z.string().optional(),
    moveInDate: z.string().optional(),
    visitSlot: z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
    message: z.string().max(1000).optional(),
    hasConsent: z.boolean().refine(val => val === true, {
        message: 'You must agree to our terms',
    }),
})

export type SectorCreateInput = z.infer<typeof sectorCreateSchema>
export type FAQCreateInput = z.infer<typeof faqCreateSchema>
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type GalleryImageCreateInput = z.infer<typeof galleryImageCreateSchema>
export type ComparisonCreateInput = z.infer<typeof comparisonCreateSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>

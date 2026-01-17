import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { leadCreateSchema, leadQuerySchema } from '@/validators/lead.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { formRateLimiter } from '@/middleware/rateLimit'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email'
import { Prisma } from '@prisma/client'
import { requireOptionalAuth } from '@/middleware/auth'

/**
 * GET /api/leads - List all leads (Admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_READ)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const validation = validateQuery(searchParams, leadQuerySchema)

        if (hasValidationError(validation)) {
            return validation.error
        }

        const query = validation.data
        const { page, limit, skip } = parsePagination(searchParams)

        // Build where clause
        const where: Prisma.LeadWhereInput = {}

        if (query.status) where.status = query.status
        if (query.priority) where.priority = query.priority
        if (query.sectorId) where.preferredSectorId = query.sectorId
        if (query.pgId) where.pgId = query.pgId
        if (query.assignedToId) where.assignedToId = query.assignedToId

        if (query.startDate || query.endDate) {
            where.createdAt = {}
            if (query.startDate) where.createdAt.gte = new Date(query.startDate)
            if (query.endDate) where.createdAt.lte = new Date(query.endDate)
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { phone: { contains: query.search } },
                { email: { contains: query.search } },
            ]
        }

        // Build orderBy
        const sortBy = query.sortBy || 'createdAt'
        const sortOrder = query.sortOrder || 'desc'
        const orderBy = { [sortBy]: sortOrder } as Prisma.LeadOrderByWithRelationInput

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: {
                    preferredSector: { select: { name: true, slug: true } },
                    pg: { select: { name: true, slug: true } },
                    assignedTo: { select: { name: true, email: true } },
                },
                ...paginationQuery({ page, limit, skip }),
                orderBy,
            }),
            prisma.lead.count({ where }),
        ])

        return NextResponse.json(paginated(leads, page, limit, total))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/leads - Create a new lead (Public with rate limiting)
 */
export async function POST(req: NextRequest) {
    try {
        const optionalAuth = await requireOptionalAuth()
        if (optionalAuth instanceof NextResponse) return optionalAuth

        const rateLimitResult = formRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const validation = await validateBody(req, leadCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        const userAgent = req.headers.get('user-agent') || undefined

        const lead = await prisma.lead.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                preferredSectorId: data.preferredSectorId,
                budgetMin: data.budgetMin,
                budgetMax: data.budgetMax,
                roomType: data.roomType,
                occupancyType: data.occupancyType,
                moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
                visitSlot: data.visitSlot,
                message: data.message,
                source: data.source,
                referrer: data.referrer,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                pgId: data.pgId,
                hasConsent: data.hasConsent,
                ipAddress,
                userAgent,
            },
            include: { preferredSector: { select: { name: true } } },
        })

        sendLeadNotification({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            message: lead.message,
            preferredSector: lead.preferredSector?.name,
            budgetMin: lead.budgetMin,
            budgetMax: lead.budgetMax,
        }).catch(console.error)

        if (lead.email) {
            sendLeadConfirmation({ name: lead.name, email: lead.email }).catch(console.error)
        }

        return NextResponse.json(
            success({ id: lead.id }, 'Thank you for your inquiry! We will contact you soon.'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

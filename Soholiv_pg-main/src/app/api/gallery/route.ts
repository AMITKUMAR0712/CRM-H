import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { galleryImageCreateSchema, galleryQuerySchema } from '@/validators/common.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { requireOptionalAuth } from '@/middleware/auth'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/gallery - List gallery images with filtering
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const validation = validateQuery(searchParams, galleryQuerySchema)

        if (hasValidationError(validation)) {
            return validation.error
        }

        const query = validation.data
        let authRole: { role: string; id: string } | null = null
        if (query.includeInactive === 'true') {
            const authResult = await requirePermission(PERMISSIONS.MEDIA_READ)
            if (authResult instanceof NextResponse) return authResult
            authRole = { role: authResult.user.role, id: authResult.user.id }
        } else {
            const optional = await requireOptionalAuth()
            if (optional instanceof NextResponse) return optional
            if (optional) {
                authRole = { role: optional.user.role, id: optional.user.id }
            }
        }
        const { page, limit, skip } = parsePagination(searchParams)

        // Build where clause
        const where: Prisma.GalleryImageWhereInput = {}

        if (query.includeInactive !== 'true') {
            where.isActive = true
        }

        if (query.album) where.album = query.album
        if (query.sectorSlug) where.sectorSlug = query.sectorSlug
        if (query.pgId) where.pgId = query.pgId
        if (query.roomType) where.roomType = query.roomType
        if (query.availability) where.availability = { contains: query.availability }
        if (query.isFeatured === 'true') where.isFeatured = true

        if (authRole?.role === 'MANAGER') {
            const assigned = await prisma.pgAssignment.findMany({
                where: { userId: authRole.id },
                select: { pgId: true },
            })

            const assignedIds = assigned.map((a) => a.pgId)
            if (!assignedIds.length) {
                return NextResponse.json(paginated([], page, limit, 0))
            }

            if (query.pgId && !assignedIds.includes(query.pgId)) {
                return NextResponse.json(paginated([], page, limit, 0))
            }

            where.pgId = query.pgId ? query.pgId : { in: assignedIds }
        }

        const [images, total] = await Promise.all([
            prisma.galleryImage.findMany({
                where,
                ...paginationQuery({ page, limit, skip }),
                orderBy: [
                    { isFeatured: 'desc' },
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.galleryImage.count({ where }),
        ])

        return NextResponse.json(paginated(images, page, limit, total))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/gallery - Create a new gallery image (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.MEDIA_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, galleryImageCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        if (authResult.user.role === 'MANAGER') {
            if (!data.pgId) return NextResponse.json(error('PG ID is required'), { status: 400 })
            const allowed = await prisma.pG.findFirst({
                where: { id: data.pgId, assignments: { some: { userId: authResult.user.id } } },
                select: { id: true },
            })
            if (!allowed) {
                return NextResponse.json(error('Insufficient permissions to add images for this PG'), { status: 403 })
            }
        }

        const image = await prisma.galleryImage.create({
            data,
        })

        return NextResponse.json(
            success(image, 'Gallery image added successfully'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

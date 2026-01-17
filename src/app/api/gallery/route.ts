import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { galleryImageCreateSchema, galleryQuerySchema } from '@/validators/common.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'

/**
 * GET /api/gallery - List gallery images with filtering
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const validation = validateQuery(searchParams, galleryQuerySchema)

        if (hasValidationError(validation)) {
            return validation.error
        }

        const query = validation.data
        const { page, limit, skip } = parsePagination(searchParams)

        // Build where clause
        const where: Prisma.GalleryImageWhereInput = {
            isActive: true,
        }

        if (query.album) where.album = query.album
        if (query.sectorSlug) where.sectorSlug = query.sectorSlug
        if (query.pgId) where.pgId = query.pgId
        if (query.isFeatured === 'true') where.isFeatured = true

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

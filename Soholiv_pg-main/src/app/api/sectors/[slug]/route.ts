import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { sectorUpdateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { apiRateLimiter } from '@/middleware/rateLimit'

interface RouteParams {
    params: Promise<{ slug: string }>
}

/**
 * GET /api/sectors/[slug] - Get a single sector with its PGs
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { slug } = await params

        const sector = await prisma.sector.findFirst({
            where: {
                OR: [{ id: slug }, { slug }],
                isActive: true,
            },
            include: {
                pgs: {
                    where: { isActive: true },
                    include: {
                        photos: { where: { isFeatured: true }, take: 1 },
                        amenities: { include: { amenity: true } },
                        _count: { select: { reviews: true } },
                    },
                    orderBy: [
                        { isFeatured: 'desc' },
                        { createdAt: 'desc' },
                    ],
                },
                faqs: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!sector) {
            return NextResponse.json(error('Sector not found'), { status: 404 })
        }

        // Calculate stats
        const stats = await prisma.pG.aggregate({
            where: { sectorId: sector.id, isActive: true },
            _min: { monthlyRent: true },
            _max: { monthlyRent: true },
            _count: true,
        })

        return NextResponse.json(success({
            ...sector,
            stats: {
                pgCount: stats._count,
                priceRange: {
                    min: stats._min.monthlyRent,
                    max: stats._max.monthlyRent,
                },
            },
        }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/sectors/[slug] - Update a sector (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.SECTOR_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { slug } = await params

        const validation = await validateBody(req, sectorUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const existing = await prisma.sector.findFirst({
            where: { OR: [{ id: slug }, { slug }] },
        })

        if (!existing) {
            return NextResponse.json(error('Sector not found'), { status: 404 })
        }

        const data = validation.data

        const sector = await prisma.sector.update({
            where: { id: existing.id },
            data: {
                ...data,
                highlights: data.highlights ? data.highlights : undefined,
            },
        })

        return NextResponse.json(success(sector, 'Sector updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/sectors/[slug] - Delete a sector (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.SECTOR_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { slug } = await params

        const existing = await prisma.sector.findFirst({
            where: { OR: [{ id: slug }, { slug }] },
        })

        if (!existing) {
            return NextResponse.json(error('Sector not found'), { status: 404 })
        }

        await prisma.sector.delete({
            where: { id: existing.id },
        })

        return NextResponse.json(success(null, 'Sector deleted successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

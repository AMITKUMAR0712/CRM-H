import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { z } from 'zod'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { apiRateLimiter } from '@/middleware/rateLimit'

const pgAmenitySchema = z.object({
    pgId: z.string().cuid(),
    amenityIds: z.array(z.string().cuid()),
})

/**
 * GET /api/pgs/amenities - Get amenities for a PG
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const pgId = searchParams.get('pgId')

        if (!pgId) return NextResponse.json(error('PG ID required'), { status: 400 })

        const pgAmenities = await prisma.pGAmenity.findMany({
            where: { pgId },
            include: { amenity: true },
        })

        return NextResponse.json(success(pgAmenities.map(pa => pa.amenity)))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PUT /api/pgs/amenities - Set amenities for a PG (Admin only)
 */
export async function PUT(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, pgAmenitySchema)
        if (hasValidationError(validation)) return validation.error

        const { pgId, amenityIds } = validation.data

        // Delete existing and create new
        await prisma.pGAmenity.deleteMany({ where: { pgId } })

        if (amenityIds.length > 0) {
            await prisma.pGAmenity.createMany({
                data: amenityIds.map(amenityId => ({ pgId, amenityId })),
            })
        }

        const updated = await prisma.pGAmenity.findMany({
            where: { pgId },
            include: { amenity: true },
        })

        return NextResponse.json(success(updated.map(pa => pa.amenity), 'Amenities updated'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

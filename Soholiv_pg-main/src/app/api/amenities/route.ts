import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { z } from 'zod'
import { apiRateLimiter } from '@/middleware/rateLimit'

const amenitySchema = z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    icon: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().default(true),
})

/**
 * GET /api/amenities - List all amenities
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const amenities = await prisma.amenity.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        })

        // Group by category
        const grouped = amenities.reduce((acc, amenity) => {
            const cat = amenity.category || 'Other'
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(amenity)
            return acc
        }, {} as Record<string, typeof amenities>)

        return NextResponse.json(success({ amenities, grouped }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/amenities - Create amenity (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, amenitySchema)
        if (hasValidationError(validation)) return validation.error

        const existing = await prisma.amenity.findUnique({ where: { slug: validation.data.slug } })
        if (existing) return NextResponse.json(error('Amenity slug already exists'), { status: 409 })

        const amenity = await prisma.amenity.create({ data: validation.data })
        return NextResponse.json(success(amenity, 'Amenity created'), { status: 201 })
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/amenities - Update amenity (Admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Amenity ID required'), { status: 400 })

        const validation = await validateBody(req, amenitySchema.partial())
        if (hasValidationError(validation)) return validation.error

        const amenity = await prisma.amenity.update({ where: { id }, data: validation.data })
        return NextResponse.json(success(amenity, 'Amenity updated'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/amenities - Delete amenity (Admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Amenity ID required'), { status: 400 })

        await prisma.amenity.delete({ where: { id } })
        return NextResponse.json(success(null, 'Amenity deleted'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

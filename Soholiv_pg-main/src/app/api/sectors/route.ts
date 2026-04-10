import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { sectorCreateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requireSuperAdmin } from '@/middleware/auth'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/sectors - List all sectors
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const sectors = await prisma.sector.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        pgs: { where: { isActive: true } },
                    },
                },
            },
            orderBy: { name: 'asc' },
        })

        // Add additional computed fields
        const sectorsWithStats = await Promise.all(
            sectors.map(async (sector) => {
                const priceRange = await prisma.pG.aggregate({
                    where: { sectorId: sector.id, isActive: true },
                    _min: { monthlyRent: true },
                    _max: { monthlyRent: true },
                })

                return {
                    ...sector,
                    pgCount: sector._count.pgs,
                    priceRange: {
                        min: priceRange._min.monthlyRent,
                        max: priceRange._max.monthlyRent,
                    },
                }
            })
        )

        return NextResponse.json(success(sectorsWithStats))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/sectors - Create a new sector (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requireSuperAdmin()
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, sectorCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Check if slug already exists
        const existing = await prisma.sector.findUnique({
            where: { slug: data.slug },
        })

        if (existing) {
            return NextResponse.json(
                error('A sector with this slug already exists'),
                { status: 409 }
            )
        }

        const sector = await prisma.sector.create({
            data: {
                ...data,
                highlights: data.highlights ? data.highlights : undefined,
            },
        })

        return NextResponse.json(
            success(sector, 'Sector created successfully'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { apiRateLimiter } from '@/middleware/rateLimit'

interface RouteParams {
    params: Promise<{ code: string }>
}

/**
 * GET /api/comparisons/[code] - Get comparison by share code
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { code } = await params

        const comparison = await prisma.comparison.findFirst({
            where: {
                shareCode: code,
                expiresAt: { gt: new Date() }, // Not expired
            },
        })

        if (!comparison) {
            return NextResponse.json(
                error('Comparison not found or expired'),
                { status: 404 }
            )
        }

        // Fetch the PGs for comparison
        const pgIds = comparison.pgIds as string[]

        const pgs = await prisma.pG.findMany({
            where: { id: { in: pgIds } },
            include: {
                sector: { select: { name: true, slug: true } },
                amenities: { include: { amenity: true } },
                photos: { where: { isFeatured: true }, take: 1 },
            },
        })

        // Sort PGs in the same order as requested
        const sortedPGs = pgIds
            .map(id => pgs.find(pg => pg.id === id))
            .filter(Boolean)

        return NextResponse.json(success({
            id: comparison.id,
            pgs: sortedPGs,
            expiresAt: comparison.expiresAt,
        }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

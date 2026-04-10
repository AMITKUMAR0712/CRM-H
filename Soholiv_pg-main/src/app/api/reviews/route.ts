import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { reviewCreateSchema, reviewUpdateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { formRateLimiter } from '@/middleware/rateLimit'
import { requireOptionalAuth } from '@/middleware/auth'

/**
 * GET /api/reviews - List approved reviews
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const pgId = searchParams.get('pgId')
        const featured = searchParams.get('featured')

        const where: { isApproved: boolean; pgId?: string; isFeatured?: boolean } = {
            isApproved: true,
        }

        if (pgId) where.pgId = pgId
        if (featured === 'true') where.isFeatured = true

        const reviews = await prisma.review.findMany({
            where,
            include: {
                pg: { select: { name: true, slug: true } },
            },
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' },
            ],
            take: featured === 'true' ? 10 : 50,
        })

        // Calculate average rating
        const stats = await prisma.review.aggregate({
            where: { isApproved: true, ...(pgId ? { pgId } : {}) },
            _avg: { rating: true },
            _count: true,
        })

        return NextResponse.json(success({
            reviews,
            stats: {
                averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
                totalReviews: stats._count,
            },
        }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/reviews - Submit a new review (Public with rate limiting)
 */
export async function POST(req: NextRequest) {
    try {
        const optionalAuth = await requireOptionalAuth()
        if (optionalAuth instanceof NextResponse) return optionalAuth

        const rateLimitResult = formRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const validation = await validateBody(req, reviewCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        const review = await prisma.review.create({
            data: {
                ...data,
                isApproved: false, // Requires admin approval
            },
        })

        return NextResponse.json(
            success(
                { id: review.id },
                'Thank you for your review! It will be visible after approval.'
            ),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/reviews - Update review status (Admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.REVIEW_MODERATE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(error('Review ID required'), { status: 400 })
        }

        const validation = await validateBody(req, reviewUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const review = await prisma.review.update({
            where: { id },
            data: validation.data,
        })

        return NextResponse.json(success(review, 'Review updated'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { comparisonCreateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { nanoid } from 'nanoid'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * POST /api/comparisons - Create a new comparison
 */
export async function POST(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const validation = await validateBody(req, comparisonCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Verify all PG IDs exist
        const pgs = await prisma.pG.findMany({
            where: { id: { in: data.pgIds }, isActive: true },
            select: { id: true },
        })

        if (pgs.length !== data.pgIds.length) {
            return NextResponse.json(
                error('One or more PGs not found'),
                { status: 400 }
            )
        }

        // Generate a short share code
        const shareCode = nanoid(8)

        // Create comparison with 48h expiry
        const comparison = await prisma.comparison.create({
            data: {
                pgIds: data.pgIds,
                sessionId: data.sessionId,
                shareCode,
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            },
        })

        return NextResponse.json(
            success({
                id: comparison.id,
                shareCode: comparison.shareCode,
                shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/smart-finder/compare/${shareCode}`,
            }, 'Comparison created'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

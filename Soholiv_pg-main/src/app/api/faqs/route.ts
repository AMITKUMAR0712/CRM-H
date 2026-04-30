import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { faqCreateSchema, faqUpdateSchema } from '@/validators/common.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { z } from 'zod'
import { apiRateLimiter } from '@/middleware/rateLimit'

const faqQuerySchema = z.object({
    category: z.string().optional(),
    sectorId: z.string().optional(),
})

/**
 * GET /api/faqs - List FAQs
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const sectorId = searchParams.get('sectorId')

        const where: { isActive: boolean; category?: string; sectorId?: string | null } = {
            isActive: true,
        }

        if (category) where.category = category
        if (sectorId) where.sectorId = sectorId

        const faqs = await prisma.fAQ.findMany({
            where,
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(success(faqs))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/faqs - Create a new FAQ (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PAGE_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, faqCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        const faq = await prisma.fAQ.create({
            data,
        })

        return NextResponse.json(
            success(faq, 'FAQ created successfully'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

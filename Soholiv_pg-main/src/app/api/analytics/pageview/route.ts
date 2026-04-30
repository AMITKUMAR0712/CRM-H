import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { z } from 'zod'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { apiRateLimiter } from '@/middleware/rateLimit'

const pageViewSchema = z.object({
    path: z.string().min(1).max(255),
    referrer: z.string().optional(),
})

/**
 * POST /api/analytics/pageview - Track page view
 */
export async function POST(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const validation = await validateBody(req, pageViewSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Get client info
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        const userAgent = req.headers.get('user-agent') || undefined

        // Create page view record
        await prisma.pageView.create({
            data: {
                path: data.path,
                referrer: data.referrer,
                ipAddress,
                userAgent,
            },
        })

        return NextResponse.json(success(null), { status: 201 })
    } catch (err) {
        // Don't expose analytics errors
        console.error('Analytics error:', err)
        return NextResponse.json(success(null), { status: 201 })
    }
}

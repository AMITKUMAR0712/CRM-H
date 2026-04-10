import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { bannerEventCreateSchema } from '@/validators/banner.validator'
import { requireOptionalAuth } from '@/middleware/auth'
import { apiRateLimiter } from '@/middleware/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = apiRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const validation = await validateBody(req, bannerEventCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data
    const optionalAuth = await requireOptionalAuth()
    if (optionalAuth instanceof NextResponse) return optionalAuth
    const session = optionalAuth

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    const event = await prisma.bannerEvent.create({
      data: {
        bannerId: data.bannerId,
        type: data.type,
        path: data.path ?? null,
        sessionId: data.sessionId ?? null,
        userId: session?.user?.id ?? null,
        ipAddress,
        userAgent,
        metadata: data.metadata as never,
      },
    })

    return NextResponse.json(created({ id: event.id }, 'Event recorded'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

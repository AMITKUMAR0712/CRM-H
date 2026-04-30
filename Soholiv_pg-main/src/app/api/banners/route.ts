import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { bannerPublicQuerySchema } from '@/validators/banner.validator'
import { apiRateLimiter } from '@/middleware/rateLimit'

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = apiRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, bannerPublicQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const now = new Date()

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTill: null }, { validTill: { gte: now } }] },
          {
            targets: {
              some: {
                scope: query.scope,
                ...(query.sectorId ? { sectorId: query.sectorId } : {}),
                ...(query.pgId ? { pgId: query.pgId } : {}),
              },
            },
          },
        ],
      },
      orderBy: [{ priority: 'desc' }, { displayOrder: 'asc' }],
      select: {
        id: true,
        type: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        ctaLabel: true,
        ctaHref: true,
        discountType: true,
        discountValue: true,
        validFrom: true,
        validTill: true,
      },
    })

    return NextResponse.json(success(banners))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

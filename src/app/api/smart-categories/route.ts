import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { smartCategoryQuerySchema } from '@/validators/smart-category.validator'
import { apiRateLimiter } from '@/middleware/rateLimit'

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = apiRateLimiter(req)
    if (rateLimitResult) return rateLimitResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, smartCategoryQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data

    const where: Record<string, unknown> = { isActive: true }
    if (query.search) {
      where.OR = [{ name: { contains: query.search } }, { slug: { contains: query.search } }]
    }

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const categories = await prismaAny.smartCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, description: true },
    })

    return NextResponse.json(success(categories))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

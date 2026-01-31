import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requireAuth } from '@/middleware/auth'
import { enquiryUserQuerySchema } from '@/validators/enquiry.validator'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, enquiryUserQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.EnquiryWhereInput = {
      userId: authResult.user.id,
    }

    if (query.status) where.status = query.status

    if (query.search) {
      where.OR = [
        { subject: { contains: query.search } },
        { message: { contains: query.search } },
      ]
    }

    if (query.from || query.to) {
      where.createdAt = {}
      if (query.from) where.createdAt.gte = new Date(query.from)
      if (query.to) where.createdAt.lte = new Date(query.to)
    }

    const [rows, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: {
          pg: { select: { id: true, name: true, slug: true } },
          sector: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.enquiry.count({ where }),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

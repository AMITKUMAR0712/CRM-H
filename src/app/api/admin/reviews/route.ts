import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.REVIEW_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.ReviewWhereInput = {}
    if (status === 'approved') where.isApproved = true
    if (status === 'pending') where.isApproved = false

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { comment: { contains: search } },
        { pg: { name: { contains: search } } },
      ]
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          pg: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json(paginated(reviews, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

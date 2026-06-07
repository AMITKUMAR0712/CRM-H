import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { enquiryQuerySchema } from '@/validators/enquiry.validator'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.ENQUIRY_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, enquiryQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const role = authResult.user.role
    const userId = authResult.user.id
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.EnquiryWhereInput = {}

    if (query.status) where.status = query.status
    if (query.type) where.type = query.type
    if (query.assignedToId) where.assignedToId = query.assignedToId
    if (query.pgId) where.pgId = query.pgId
    if (query.sectorId) where.sectorId = query.sectorId

    if (query.from || query.to) {
      where.createdAt = {}
      if (query.from) where.createdAt.gte = new Date(query.from)
      if (query.to) where.createdAt.lte = new Date(query.to)
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
        { subject: { contains: query.search } },
      ]
    }

    const [rows, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
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

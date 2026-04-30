import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { leadQuerySchema } from '@/validators/lead.validator'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LEAD_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, leadQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const role = authResult.user.role
    const userId = authResult.user.id
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.LeadWhereInput = {}

    if (query.status) where.status = query.status
    if (query.priority) where.priority = query.priority
    if (query.sectorId) where.preferredSectorId = query.sectorId
    if (query.pgId) where.pgId = query.pgId
    if (query.assignedToId) where.assignedToId = query.assignedToId
    if (role === 'MANAGER') where.assignedToId = userId

    if (query.startDate || query.endDate) {
      where.createdAt = {}
      if (query.startDate) where.createdAt.gte = new Date(query.startDate)
      if (query.endDate) where.createdAt.lte = new Date(query.endDate)
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { phone: { contains: query.search } },
        { email: { contains: query.search } },
      ]
    }

    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    const orderBy = { [sortBy]: sortOrder } as Prisma.LeadOrderByWithRelationInput

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          preferredSector: { select: { id: true, name: true, slug: true } },
          pg: { select: { id: true, name: true, slug: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
        },
        ...paginationQuery({ page, limit, skip }),
        orderBy,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json(paginated(leads, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

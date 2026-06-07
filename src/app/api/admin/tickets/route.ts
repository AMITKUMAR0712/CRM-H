import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { ticketQuerySchema } from '@/validators/ticket.validator'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.TICKET_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, ticketQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const role = authResult.user.role
    const userId = authResult.user.id
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.TicketWhereInput = {}

    if (query.status) where.status = query.status
    if (query.priority) where.priority = query.priority
    if (query.category) where.category = query.category
    if (query.assignedToId) where.assignedToId = query.assignedToId

    if (query.search) {
      where.OR = [{ subject: { contains: query.search } }, { description: { contains: query.search } }]
    }

    const [rows, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          pg: { select: { id: true, name: true, slug: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { updatedAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.ticket.count({ where }),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

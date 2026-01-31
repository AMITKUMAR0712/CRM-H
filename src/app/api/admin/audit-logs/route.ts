import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import type { AuthSession } from '@/middleware/auth'

const auditLogQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  action: z.string().optional(),
  entityType: z.string().optional(),
  actorId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LOGS_READ)
    if (authResult instanceof NextResponse) return authResult

    const session = authResult as AuthSession
    const canSeeActorDetails =
      hasPermission(session.user.role, PERMISSIONS.USER_READ) ||
      hasPermission(session.user.role, PERMISSIONS.USERS_BLOCK)

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, auditLogQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.AuditLogWhereInput = {}
    if (query.action) where.action = { contains: query.action }
    if (query.entityType) where.entityType = { contains: query.entityType }
    if (query.actorId) where.actorId = query.actorId

    if (query.search) {
      where.OR = [
        { summary: { contains: query.search } },
        { entityId: { contains: query.search } },
      ]
    }

    if (query.from || query.to) {
      where.createdAt = {}
      if (query.from) where.createdAt.gte = new Date(query.from)
      if (query.to) where.createdAt.lte = new Date(query.to)
    }

    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: canSeeActorDetails
              ? { id: true, name: true, email: true, role: true }
              : { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

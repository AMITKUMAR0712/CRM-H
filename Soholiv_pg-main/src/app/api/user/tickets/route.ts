import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { ticketCreateSchema, ticketQuerySchema } from '@/validators/ticket.validator'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, ticketQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where = {
      userId: authResult.user.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.category ? { category: query.category } : {}),
    } as const

    const [rows, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
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

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, ticketCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const ticket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.ticket.create({
        data: {
          userId: authResult.user.id,
          pgId: data.pgId ?? null,
          category: data.category,
          priority: data.priority ?? 'MEDIUM',
          subject: data.subject,
          description: data.description,
          slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })

      await tx.ticketMessage.create({
        data: {
          ticketId: createdTicket.id,
          authorId: authResult.user.id,
          body: data.description,
          isInternal: false,
        },
      })

      return createdTicket
    })

    return NextResponse.json(created({ id: ticket.id }, 'Ticket created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

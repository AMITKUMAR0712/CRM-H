import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import { ticketUpdateSchema } from '@/validators/ticket.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.TICKET_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        pg: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, email: true, role: true } }, attachments: true },
        },
      },
    })

    if (!ticket) return NextResponse.json(error('Ticket not found'), { status: 404 })

    return NextResponse.json(success(ticket))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.TICKET_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.ticket.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
    })
    if (!existing) return NextResponse.json(error('Ticket not found'), { status: 404 })

    const validation = await validateBody(req, ticketUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    if (
      data.assignedToId !== undefined &&
      data.assignedToId !== existing.assignedToId &&
      !hasPermission(authResult.user.role, PERMISSIONS.TICKET_ASSIGN)
    ) {
      return NextResponse.json(error('Insufficient permissions to assign ticket'), { status: 403 })
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: data.status,
        assignedToId: data.assignedToId === undefined ? undefined : data.assignedToId,
        slaDueAt: data.slaDueAt === undefined ? undefined : data.slaDueAt ? new Date(data.slaDueAt) : null,
        resolvedAt: data.status === 'RESOLVED' ? existing.resolvedAt ?? new Date() : existing.resolvedAt,
        closedAt: data.status === 'CLOSED' ? existing.closedAt ?? new Date() : existing.closedAt,
      },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'ticket.update',
      entityType: 'Ticket',
      entityId: id,
      summary: `Updated ticket ${id}`,
      metadata: { from: { status: existing.status, assignedToId: existing.assignedToId }, to: data },
    })

    return NextResponse.json(success(updated, 'Ticket updated'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

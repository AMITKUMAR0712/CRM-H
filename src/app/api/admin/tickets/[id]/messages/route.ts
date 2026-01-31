import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { ticketMessageCreateSchema } from '@/validators/ticket.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.TICKET_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
    })
    if (!ticket) return NextResponse.json(error('Ticket not found'), { status: 404 })

    const validation = await validateBody(req, ticketMessageCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        authorId: authResult.user.id,
        body: validation.data.body,
        isInternal: validation.data.isInternal ?? false,
        attachments: validation.data.attachments?.length
          ? {
              createMany: {
                data: validation.data.attachments.map((a) => ({
                  url: a.url,
                  mimeType: a.mimeType ?? null,
                  sizeBytes: a.sizeBytes ?? null,
                })),
              },
            }
          : undefined,
      },
      include: { attachments: true },
    })

    await prisma.ticket.update({ where: { id }, data: { updatedAt: new Date() } })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'ticket.message.create',
      entityType: 'Ticket',
      entityId: id,
      summary: `Posted ticket message ${message.id}`,
      metadata: { isInternal: message.isInternal },
    })

    return NextResponse.json(success(message, 'Message posted'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

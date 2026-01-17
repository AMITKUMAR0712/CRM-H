import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { ticketMessageCreateSchema } from '@/validators/ticket.validator'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const ticket = await prisma.ticket.findFirst({ where: { id, userId: authResult.user.id } })
    if (!ticket) return NextResponse.json(error('Ticket not found'), { status: 404 })

    const validation = await validateBody(req, ticketMessageCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        authorId: authResult.user.id,
        body: validation.data.body,
        isInternal: false,
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

    return NextResponse.json(success(message, 'Message sent'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

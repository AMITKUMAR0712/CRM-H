import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const ticket = await prisma.ticket.findFirst({
      where: { id, userId: authResult.user.id },
      include: {
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

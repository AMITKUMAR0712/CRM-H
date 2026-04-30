import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { chatMessageCreateSchema } from '@/validators/chat.validator'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const thread = await prisma.chatThread.findFirst({ where: { id, userId: authResult.user.id } })
    if (!thread) return NextResponse.json(error('Chat thread not found'), { status: 404 })

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: id },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(success({ thread, messages }))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const thread = await prisma.chatThread.findFirst({ where: { id, userId: authResult.user.id } })
    if (!thread) return NextResponse.json(error('Chat thread not found'), { status: 404 })
    if (thread.status === 'CLOSED') return NextResponse.json(error('Chat is closed'), { status: 400 })

    const validation = await validateBody(req, chatMessageCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const message = await prisma.chatMessage.create({
      data: {
        threadId: id,
        senderId: authResult.user.id,
        body: validation.data.body,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    })

    await prisma.chatThread.update({ where: { id }, data: { lastMessageAt: new Date() } })

    return NextResponse.json(success(message, 'Message sent'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

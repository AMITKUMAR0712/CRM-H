import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { chatMessageCreateSchema } from '@/validators/chat.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.CHAT_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const thread = await prisma.chatThread.findFirst({
      where: {
        id,
      },
    })
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

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'chat.message.create',
      entityType: 'ChatThread',
      entityId: id,
      summary: `Posted chat message ${message.id}`,
    })

    return NextResponse.json(success(message, 'Message sent'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

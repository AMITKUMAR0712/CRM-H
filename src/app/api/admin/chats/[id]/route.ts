import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { chatThreadUpdateSchema } from '@/validators/chat.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.CHAT_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const thread = await prisma.chatThread.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        pgId: true,
        status: true,
        mutedUntil: true,
        closedAt: true,
        lastMessageAt: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        pg: { select: { id: true, name: true, slug: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            threadId: true,
            senderId: true,
            body: true,
            isSystem: true,
            createdAt: true,
            sender: { select: { id: true, name: true, role: true } },
          },
        },
      },
    })

    if (!thread) return NextResponse.json(error('Chat thread not found'), { status: 404 })

    return NextResponse.json(success(thread))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.CHAT_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.chatThread.findFirst({
      where: {
        id,
      },
    })
    if (!existing) return NextResponse.json(error('Chat thread not found'), { status: 404 })

    const validation = await validateBody(req, chatThreadUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const updated = await prisma.chatThread.update({
      where: { id },
      data: {
        status: data.status,
        mutedUntil: data.mutedUntil === undefined ? undefined : data.mutedUntil ? new Date(data.mutedUntil) : null,
        closedAt: data.status === 'CLOSED' ? existing.closedAt ?? new Date() : existing.closedAt,
      },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'chat.thread.update',
      entityType: 'ChatThread',
      entityId: id,
      summary: `Updated chat thread ${id}`,
      metadata: { from: { status: existing.status }, to: data },
    })

    return NextResponse.json(success(updated, 'Chat updated'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

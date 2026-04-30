import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAuth } from '@/middleware/auth'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { chatThreadCreateSchema } from '@/validators/chat.validator'

export async function GET(_req: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const threads = await prisma.chatThread.findMany({
      where: { userId: authResult.user.id },
      include: {
        pg: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(success(threads))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, chatThreadCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.chatThread.findFirst({
      where: { userId: authResult.user.id, pgId: data.pgId ?? null, status: { not: 'CLOSED' } },
    })

    if (existing) return NextResponse.json(success(existing))

    const thread = await prisma.chatThread.create({
      data: { userId: authResult.user.id, pgId: data.pgId ?? null },
    })

    return NextResponse.json(created(thread, 'Chat created'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

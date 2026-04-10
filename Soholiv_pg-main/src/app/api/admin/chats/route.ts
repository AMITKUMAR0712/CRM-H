import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.CHAT_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const { page, limit, skip } = parsePagination(searchParams)

    const [rows, total] = await Promise.all([
      prisma.chatThread.findMany({
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
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.chatThread.count(),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

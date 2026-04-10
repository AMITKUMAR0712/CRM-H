import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.REVIEW_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.review.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Review not found'), { status: 404 })

    await prisma.review.delete({ where: { id } })

    return NextResponse.json(success(null, 'Review deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

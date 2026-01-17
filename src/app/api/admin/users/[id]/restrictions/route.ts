import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requireAnyPermission, requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { restrictionCreateSchema, restrictionRevokeSchema } from '@/validators/restriction.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAnyPermission([PERMISSIONS.USER_READ, PERMISSIONS.USERS_BLOCK])
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const rows = await prisma.userRestriction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(success(rows))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.USERS_BLOCK)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json(error('User not found'), { status: 404 })

    const validation = await validateBody(req, restrictionCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const restriction = await prisma.userRestriction.create({
      data: {
        userId: id,
        type: validation.data.type,
        reason: validation.data.reason ?? null,
        endsAt: validation.data.endsAt ? new Date(validation.data.endsAt) : null,
        createdById: authResult.user.id,
      },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'user.restriction.create',
      entityType: 'UserRestriction',
      entityId: restriction.id,
      summary: `Restricted user ${user.email} (${restriction.type})`,
      metadata: { userId: id, type: restriction.type, endsAt: restriction.endsAt },
    })

    return NextResponse.json(success(restriction, 'User restriction applied'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.USERS_BLOCK)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, restrictionRevokeSchema)
    if (hasValidationError(validation)) return validation.error

    const active = await prisma.userRestriction.findFirst({
      where: { userId: id, isActive: true, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    if (!active) return NextResponse.json(error('No active restriction found'), { status: 404 })

    const revoked = await prisma.userRestriction.update({
      where: { id: active.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedById: authResult.user.id,
        revokedReason: validation.data.revokedReason ?? null,
      },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'user.restriction.revoke',
      entityType: 'UserRestriction',
      entityId: revoked.id,
      summary: `Revoked restriction ${revoked.id} for user ${id}`,
    })

    return NextResponse.json(success(revoked, 'User restriction revoked'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

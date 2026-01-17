import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requireAnyPermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { hasPermission } from '@/lib/rbac'

export async function GET() {
  try {
    const authResult = await requireAnyPermission([
      PERMISSIONS.USER_READ,
      PERMISSIONS.USERS_BLOCK,
      PERMISSIONS.LEAD_ASSIGN,
      PERMISSIONS.ENQUIRY_ASSIGN,
      PERMISSIONS.TICKET_ASSIGN,
    ])
    if (authResult instanceof NextResponse) return authResult

    const canSeeRoles = hasPermission(authResult.user.role, PERMISSIONS.USER_READ)

    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    })

    const result = canSeeRoles ? users : users.map((u) => ({ id: u.id, name: u.name, email: u.email }))

    return NextResponse.json(success(result))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

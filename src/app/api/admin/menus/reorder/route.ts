import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { menuItemReorderSchema } from '@/validators/menu.validator'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MENU_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, menuItemReorderSchema)
    if (hasValidationError(validation)) return validation.error

    const { items } = validation.data

    await prisma.$transaction(
      items.map((it) =>
        prisma.menuItem.update({
          where: { id: it.id },
          data: { parentId: it.parentId ?? null, order: it.order },
        })
      )
    )

    return NextResponse.json(success(true, 'Menu reordered'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

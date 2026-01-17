import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { menuItemCreateSchema, menuItemQuerySchema } from '@/validators/menu.validator'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MENU_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, menuItemQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data

    const includeInactive = query.includeInactive === 'true'
    const includeDeleted = query.includeDeleted === 'true'

    const where = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(includeDeleted ? {} : { deletedAt: null as null }),
      ...(query.visibility ? { visibility: query.visibility } : {}),
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      include: {
        page: { select: { id: true, title: true, slug: true, status: true, isActive: true } },
      },
    })

    return NextResponse.json(success(items))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MENU_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const session = authResult

    const validation = await validateBody(req, menuItemCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    if (data.type === 'PAGE') {
      const page = await prisma.page.findFirst({
        where: { id: data.pageId!, deletedAt: null, isActive: true },
        select: { id: true },
      })
      if (!page) return NextResponse.json(error('Referenced page not found or inactive'), { status: 404 })
    }

    const resolvedParentId = data.parentId ?? null

    const order =
      typeof data.order === 'number'
        ? data.order
        : (
            (await prisma.menuItem.aggregate({
              where: { parentId: resolvedParentId, deletedAt: null },
              _max: { order: true },
            }))
              ._max.order ?? -1
          ) + 1

    const item = await prisma.menuItem.create({
      data: {
        title: data.title,
        type: data.type,
        href: data.type === 'URL' ? data.href! : null,
        pageId: data.type === 'PAGE' ? data.pageId! : null,
        parentId: resolvedParentId,
        order,
        visibility: data.visibility,
        isActive: data.isActive,
        openInNewTab: data.openInNewTab,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
      include: {
        page: { select: { id: true, title: true, slug: true, status: true, isActive: true } },
      },
    })

    return NextResponse.json(created(item, 'Menu item created'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

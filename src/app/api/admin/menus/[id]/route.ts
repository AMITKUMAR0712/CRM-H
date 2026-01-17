import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { menuItemUpdateSchema } from '@/validators/menu.validator'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MENU_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const session = authResult
    const { id } = await ctx.params

    const existing = await prisma.menuItem.findFirst({ where: { id, deletedAt: null } })
    if (!existing) return NextResponse.json(error('Menu item not found'), { status: 404 })

    const validation = await validateBody(req, menuItemUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const effectiveType = data.type ?? existing.type

    if (data.type === 'PAGE') {
      const page = await prisma.page.findFirst({
        where: { id: data.pageId!, deletedAt: null, isActive: true },
        select: { id: true },
      })
      if (!page) return NextResponse.json(error('Referenced page not found or inactive'), { status: 404 })
    }

    if (effectiveType === 'PAGE' && data.pageId) {
      const page = await prisma.page.findFirst({
        where: { id: data.pageId, deletedAt: null, isActive: true },
        select: { id: true },
      })
      if (!page) return NextResponse.json(error('Referenced page not found or inactive'), { status: 404 })
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.openInNewTab !== undefined ? { openInNewTab: data.openInNewTab } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId ?? null } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(effectiveType === 'URL'
          ? {
              ...(data.href !== undefined ? { href: data.href } : {}),
              ...(data.type === 'URL' ? { pageId: null } : {}),
            }
          : effectiveType === 'PAGE'
            ? {
                ...(data.pageId !== undefined ? { pageId: data.pageId } : {}),
                ...(data.type === 'PAGE' ? { href: null } : {}),
              }
            : {}),
        updatedById: session.user.id,
      },
      include: {
        page: { select: { id: true, title: true, slug: true, status: true, isActive: true } },
      },
    })

    return NextResponse.json(success(updated, 'Menu item updated'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MENU_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await ctx.params

    const existing = await prisma.menuItem.findFirst({ where: { id, deletedAt: null } })
    if (!existing) return NextResponse.json(error('Menu item not found'), { status: 404 })

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })

    return NextResponse.json(success(updated, 'Menu item deleted'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

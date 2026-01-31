import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { smartCategoryUpdateSchema } from '@/validators/smart-category.validator'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SMART_CATEGORY_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const category = await prismaAny.smartCategory.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!category) return NextResponse.json(error('Category not found'), { status: 404 })

    return NextResponse.json(success(category))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SMART_CATEGORY_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, smartCategoryUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const existing = await prismaAny.smartCategory.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Category not found'), { status: 404 })

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prismaAny.smartCategory.findUnique({ where: { slug: data.slug } })
      if (slugExists) return NextResponse.json(error('A category with this slug already exists'), { status: 409 })
    }

    const category = await prismaAny.smartCategory.update({ where: { id }, data })

    return NextResponse.json(success(category, 'Category updated'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SMART_CATEGORY_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const existing = await prismaAny.smartCategory.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Category not found'), { status: 404 })

    await prismaAny.smartCategory.delete({ where: { id } })

    return NextResponse.json(success(null, 'Category deleted'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

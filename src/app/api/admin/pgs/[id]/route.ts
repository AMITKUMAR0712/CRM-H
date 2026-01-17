import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgUpdateSchema } from '@/validators/pg.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const pg = await prisma.pG.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        sector: true,
        amenities: { include: { amenity: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
      },
    })

    if (!pg) return NextResponse.json(error('PG not found'), { status: 404 })

    return NextResponse.json(success(pg))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, pgUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.pG.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('PG not found'), { status: 404 })

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.pG.findUnique({ where: { slug: data.slug } })
      if (slugExists) return NextResponse.json(error('A PG with this slug already exists'), { status: 409 })
    }

    const pg = await prisma.pG.update({
      where: { id },
      data,
      include: { sector: true },
    })

    return NextResponse.json(success(pg, 'PG updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.pG.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('PG not found'), { status: 404 })

    await prisma.pG.delete({ where: { id } })

    return NextResponse.json(success(null, 'PG deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { sectorUpdateSchema } from '@/validators/common.validator'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SECTOR_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const sector = await prisma.sector.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!sector) return NextResponse.json(error('Location not found'), { status: 404 })

    return NextResponse.json(success(sector))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SECTOR_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, sectorUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const existing = await prisma.sector.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!existing) return NextResponse.json(error('Location not found'), { status: 404 })

    const data = validation.data

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.sector.findUnique({ where: { slug: data.slug } })
      if (slugExists) return NextResponse.json(error('A sector with this slug already exists'), { status: 409 })
    }

    const sector = await prisma.sector.update({
      where: { id: existing.id },
      data: {
        ...data,
        highlights: data.highlights ? data.highlights : undefined,
      },
    })

    return NextResponse.json(success(sector, 'Location updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SECTOR_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.sector.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })

    if (!existing) return NextResponse.json(error('Location not found'), { status: 404 })

    await prisma.sector.delete({ where: { id: existing.id } })

    return NextResponse.json(success(null, 'Location deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { galleryImageUpdateSchema } from '@/validators/common.validator'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MEDIA_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const image = await prisma.galleryImage.findUnique({ where: { id } })
    if (!image) return NextResponse.json(error('Gallery image not found'), { status: 404 })

    if (authResult.user.role === 'MANAGER') {
      if (!image.pgId) return NextResponse.json(error('Insufficient permissions to view this image'), { status: 403 })
      const allowed = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT id FROM pg_assignments WHERE pgId = ${image.pgId} AND userId = ${authResult.user.id} LIMIT 1
      `)
      if (!allowed.length) return NextResponse.json(error('Insufficient permissions to view this image'), { status: 403 })
    }

    return NextResponse.json(success(image))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MEDIA_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, galleryImageUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const existing = await prisma.galleryImage.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Gallery image not found'), { status: 404 })

    if (authResult.user.role === 'MANAGER') {
      if (!existing.pgId) return NextResponse.json(error('Insufficient permissions to edit this image'), { status: 403 })
      const allowed = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT id FROM pg_assignments WHERE pgId = ${existing.pgId} AND userId = ${authResult.user.id} LIMIT 1
      `)
      if (!allowed.length) return NextResponse.json(error('Insufficient permissions to edit this image'), { status: 403 })
    }

    const image = await prisma.galleryImage.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json(success(image, 'Gallery image updated'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.MEDIA_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.galleryImage.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Gallery image not found'), { status: 404 })

    if (authResult.user.role === 'MANAGER') {
      return NextResponse.json(error('Insufficient permissions to delete images'), { status: 403 })
    }

    await prisma.galleryImage.delete({ where: { id } })

    return NextResponse.json(success(null, 'Gallery image deleted'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

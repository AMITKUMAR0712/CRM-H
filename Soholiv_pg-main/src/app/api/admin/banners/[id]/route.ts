import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { bannerUpdateSchema } from '@/validators/banner.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const banner = await prisma.banner.findUnique({ where: { id }, include: { targets: true } })
    if (!banner) return NextResponse.json(error('Banner not found'), { status: 404 })

    return NextResponse.json(success(banner))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_MANAGE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, bannerUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.banner.findUnique({ where: { id }, include: { targets: true } })
    if (!existing) return NextResponse.json(error('Banner not found'), { status: 404 })

    if (data.discountType && !data.discountValue) {
      return NextResponse.json(error('discountValue is required when discountType is provided'), { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const banner = await tx.banner.update({
        where: { id },
        data: {
          type: data.type,
          title: data.title,
          subtitle: data.subtitle === undefined ? undefined : data.subtitle ?? null,
          imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl ?? null,
          ctaLabel: data.ctaLabel === undefined ? undefined : data.ctaLabel ?? null,
          ctaHref: data.ctaHref === undefined ? undefined : data.ctaHref ?? null,
          discountType: data.discountType === undefined ? undefined : data.discountType ?? null,
          discountValue: data.discountValue === undefined ? undefined : data.discountValue ?? null,
          validFrom: data.validFrom === undefined ? undefined : data.validFrom ? new Date(data.validFrom) : null,
          validTill: data.validTill === undefined ? undefined : data.validTill ? new Date(data.validTill) : null,
          isActive: data.isActive,
          priority: data.priority,
          displayOrder: data.displayOrder,
          updatedById: authResult.user.id,
        },
      })

      if (data.targets) {
        await tx.bannerTarget.deleteMany({ where: { bannerId: id } })
        await tx.bannerTarget.createMany({
          data: data.targets.map((t) => ({
            bannerId: id,
            scope: t.scope,
            sectorId: t.sectorId ?? null,
            pgId: t.pgId ?? null,
          })),
        })
      }

      return tx.banner.findUnique({ where: { id }, include: { targets: true } })
    })

    if (!updated) return NextResponse.json(error('Failed to update banner'), { status: 500 })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'banner.update',
      entityType: 'Banner',
      entityId: id,
      summary: `Updated banner ${updated.title}`,
    })

    return NextResponse.json(success(updated, 'Banner updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_MANAGE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.banner.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Banner not found'), { status: 404 })

    await prisma.banner.delete({ where: { id } })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'banner.delete',
      entityType: 'Banner',
      entityId: id,
      summary: `Deleted banner ${existing.title}`,
    })

    return NextResponse.json(success(null, 'Banner deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

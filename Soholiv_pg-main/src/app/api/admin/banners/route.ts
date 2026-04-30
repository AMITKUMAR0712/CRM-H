import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { created, error, paginated } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { bannerCreateSchema, bannerQuerySchema } from '@/validators/banner.validator'
import { logAudit } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, bannerQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.BannerWhereInput = {}

    if (query.type) where.type = query.type
    if (query.isActive) where.isActive = query.isActive === 'true'
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { subtitle: { contains: query.search } },
      ]
    }

    const [rows, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        include: { targets: true },
        orderBy: [{ priority: 'desc' }, { displayOrder: 'asc' }, { updatedAt: 'desc' }],
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.banner.count({ where }),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BANNERS_MANAGE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, bannerCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    if (data.discountType && !data.discountValue) {
      return NextResponse.json(error('discountValue is required when discountType is provided'), { status: 400 })
    }

    const banner = await prisma.$transaction(async (tx) => {
      const createdBanner = await tx.banner.create({
        data: {
          type: data.type,
          title: data.title,
          subtitle: data.subtitle ?? null,
          imageUrl: data.imageUrl ?? null,
          ctaLabel: data.ctaLabel ?? null,
          ctaHref: data.ctaHref ?? null,
          discountType: data.discountType ?? null,
          discountValue: data.discountValue ?? null,
          validFrom: data.validFrom ? new Date(data.validFrom) : null,
          validTill: data.validTill ? new Date(data.validTill) : null,
          isActive: data.isActive ?? true,
          priority: data.priority ?? 0,
          displayOrder: data.displayOrder ?? 0,
          createdById: authResult.user.id,
          updatedById: authResult.user.id,
        },
      })

      await tx.bannerTarget.createMany({
        data: data.targets.map((t) => ({
          bannerId: createdBanner.id,
          scope: t.scope,
          sectorId: t.sectorId ?? null,
          pgId: t.pgId ?? null,
        })),
      })

      return tx.banner.findUnique({ where: { id: createdBanner.id }, include: { targets: true } })
    })

    if (!banner) return NextResponse.json(error('Failed to create banner'), { status: 500 })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'banner.create',
      entityType: 'Banner',
      entityId: banner.id,
      summary: `Created banner ${banner.title}`,
    })

    return NextResponse.json(created(banner, 'Banner created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

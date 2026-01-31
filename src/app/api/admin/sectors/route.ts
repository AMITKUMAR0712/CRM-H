import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { paginated, success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { sectorCreateSchema } from '@/validators/common.validator'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { requireSuperAdmin } from '@/middleware/auth'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SECTOR_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.SectorWhereInput = {}
    if (isActive === 'true') where.isActive = true
    if (isActive === 'false') where.isActive = false
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [sectors, total] = await Promise.all([
      prisma.sector.findMany({
        where,
        include: {
          _count: { select: { pgs: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prisma.sector.count({ where }),
    ])

    return NextResponse.json(paginated(sectors, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, sectorCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.sector.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json(error('A sector with this slug already exists'), { status: 409 })

    const sector = await prisma.sector.create({
      data: {
        ...data,
        highlights: data.highlights ? data.highlights : undefined,
      },
    })

    return NextResponse.json(success(sector, 'Location created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

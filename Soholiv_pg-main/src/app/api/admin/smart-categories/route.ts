import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { paginated, success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { smartCategoryCreateSchema, smartCategoryQuerySchema } from '@/validators/smart-category.validator'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SMART_CATEGORY_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, smartCategoryQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Record<string, unknown> = {}
    if (query.includeInactive !== 'true') where.isActive = true
    if (query.search) {
      where.OR = [{ name: { contains: query.search } }, { slug: { contains: query.search } }]
    }

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const [rows, total] = await Promise.all([
      prismaAny.smartCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginationQuery({ page, limit, skip }),
      }),
      prismaAny.smartCategory.count({ where }),
    ])

    return NextResponse.json(paginated(rows, page, limit, total))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.SMART_CATEGORY_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, smartCategoryCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const prismaAny = prisma as unknown as { smartCategory: typeof prisma.category }

    const existing = await prismaAny.smartCategory.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json(error('A category with this slug already exists'), { status: 409 })

    const category = await prismaAny.smartCategory.create({ data })
    return NextResponse.json(success(category, 'Category created'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

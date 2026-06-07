import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgCreateSchema, pgQuerySchema } from '@/validators/pg.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import type { Prisma } from '@prisma/client'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, pgQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where = {} as Prisma.PGWhereInput

    if (query.isActive === 'true') where.isActive = true
    if (query.isActive === 'false') where.isActive = false
    const sectorFilter: Prisma.SectorWhereInput = {}
    if (query.sector) sectorFilter.slug = query.sector
    if (query.metroDistance) {
      const distance = parseFloat(query.metroDistance)
      if (!Number.isNaN(distance)) sectorFilter.metroDistance = { lte: distance }
    }
    if (Object.keys(sectorFilter).length > 0) where.sector = sectorFilter
    if (query.roomType) where.roomType = query.roomType
    if (query.occupancyType) where.occupancyType = query.occupancyType
    if (query.category) {
      ; (where as Prisma.PGWhereInput & { categories: unknown }).categories = {
        some: { category: { slug: query.category } },
      }
    }
    if (query.approvalStatus) {
      ; (where as Prisma.PGWhereInput & { approvalStatus?: unknown }).approvalStatus = query.approvalStatus
    }

    if (query.minRent || query.maxRent) {
      where.monthlyRent = {}
      if (query.minRent) where.monthlyRent.gte = parseInt(query.minRent)
      if (query.maxRent) where.monthlyRent.lte = parseInt(query.maxRent)
    }

    if (query.hasAC === 'true') where.hasAC = true
    if (query.hasWifi === 'true') where.hasWifi = true
    if (query.hasParking === 'true') where.hasParking = true
    if (query.hasGym === 'true') where.hasGym = true
    if (query.hasPowerBackup === 'true') where.hasPowerBackup = true
    if (query.hasLaundry === 'true') where.hasLaundry = true
    if (query.hasTV === 'true') where.hasTV = true
    if (query.hasFridge === 'true') where.hasFridge = true
    if (query.mealsIncluded === 'true') where.mealsIncluded = true
    if (query.isFeatured === 'true') where.isFeatured = true

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { address: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    // Removed mandatory MANAGER assignment filter to allow full data visibility for testing/management

    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    const orderBy = { [sortBy]: sortOrder } as Prisma.PGOrderByWithRelationInput

    const include = {
      sector: { select: { id: true, name: true, slug: true } },
      photos: { where: { isFeatured: true }, take: 1 },
      categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
    } as const

    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        include: include as unknown as Prisma.PGInclude,
        ...paginationQuery({ page, limit, skip }),
        orderBy,
      }),
      prisma.pG.count({ where }),
    ])

    return NextResponse.json(paginated(pgs, page, limit, total))
  } catch (err) {
    console.error('Admin PGs GET Error:', err)
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, pgCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.pG.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json(error('A PG with this slug already exists'), { status: 409 })

    const { categoryIds, approvalStatus, blockedReason, assignedManagerIds, ...pgData } = data

    const isSuperAdmin = authResult.user.role === 'SUPER_ADMIN'
    let assignments: Record<string, unknown> | undefined

    if (authResult.user.role === 'MANAGER') {
      assignments = { create: { userId: authResult.user.id } }
    } else if (assignedManagerIds?.length) {
      if (!isSuperAdmin) {
        return NextResponse.json(error('Insufficient permissions to assign managers'), { status: 403 })
      }

      const managers = await prisma.user.findMany({
        where: { id: { in: assignedManagerIds }, role: 'MANAGER' },
        select: { id: true },
      })

      if (managers.length !== assignedManagerIds.length) {
        return NextResponse.json(error('Invalid manager assignments'), { status: 400 })
      }

      assignments = { create: managers.map((m) => ({ userId: m.id })) }
    }

    const canApprove = hasPermission(authResult.user.role, PERMISSIONS.PG_APPROVE)
    const approvalPayload = canApprove
      ? {
        approvalStatus: approvalStatus ?? 'APPROVED',
        approvedAt: approvalStatus === 'APPROVED' || approvalStatus === undefined ? new Date() : null,
        approvedById: authResult.user.id,
        blockedReason: approvalStatus === 'BLOCKED' ? blockedReason ?? 'Blocked by admin' : null,
      }
      : {
        approvalStatus: 'PENDING',
        approvedAt: null,
        approvedById: null,
        blockedReason: null,
      }

    if (categoryIds?.length && !isSuperAdmin) {
      return NextResponse.json(error('Insufficient permissions to manage categories'), { status: 403 })
    }

    const createData = {
      ...pgData,
      createdById: authResult.user.id,
      ...approvalPayload,
      categories: categoryIds?.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      assignments,
    }

    const pg = await prisma.pG.create({
      data: createData as unknown as Prisma.PGCreateInput,
      include: { sector: { select: { id: true, name: true, slug: true } } },
    })

    return NextResponse.json(success(pg, 'PG created successfully'), { status: 201 })
  } catch (err) {
    console.error('Admin PGs POST Error:', err)
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

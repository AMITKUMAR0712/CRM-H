import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgCreateSchema, pgQuerySchema } from '@/validators/pg.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma } from '@prisma/client'

/**
 * GET /api/pgs - List all PGs with filtering and pagination
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const validation = validateQuery(searchParams, pgQuerySchema)

        if (hasValidationError(validation)) {
            return validation.error
        }

        const query = validation.data
        const { page, limit, skip } = parsePagination(searchParams)

        // Build where clause
        const where: Prisma.PGWhereInput = {}

        if (query.isActive !== 'false') {
            where.isActive = true
        }

        if (query.sector) where.sector = { slug: query.sector }
        if (query.roomType) where.roomType = query.roomType
        if (query.occupancyType) where.occupancyType = query.occupancyType

        if (query.minRent || query.maxRent) {
            where.monthlyRent = {}
            if (query.minRent) where.monthlyRent.gte = parseInt(query.minRent)
            if (query.maxRent) where.monthlyRent.lte = parseInt(query.maxRent)
        }

        if (query.hasAC === 'true') where.hasAC = true
        if (query.hasWifi === 'true') where.hasWifi = true
        if (query.hasParking === 'true') where.hasParking = true
        if (query.hasGym === 'true') where.hasGym = true
        if (query.mealsIncluded === 'true') where.mealsIncluded = true
        if (query.isFeatured === 'true') where.isFeatured = true

        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { address: { contains: query.search } },
                { description: { contains: query.search } },
            ]
        }

        // Build orderBy
        const sortBy = query.sortBy || 'createdAt'
        const sortOrder = query.sortOrder || 'desc'
        const orderBy = { [sortBy]: sortOrder } as Prisma.PGOrderByWithRelationInput

        const [pgs, total] = await Promise.all([
            prisma.pG.findMany({
                where,
                include: {
                    sector: { select: { name: true, slug: true } },
                    amenities: { include: { amenity: true } },
                    photos: { where: { isFeatured: true }, take: 1 },
                    _count: { select: { reviews: true } },
                },
                ...paginationQuery({ page, limit, skip }),
                orderBy,
            }),
            prisma.pG.count({ where }),
        ])

        return NextResponse.json(paginated(pgs, page, limit, total))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/pgs - Create a new PG (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, pgCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        const existing = await prisma.pG.findUnique({
            where: { slug: data.slug },
        })

        if (existing) {
            return NextResponse.json(
                error('A PG with this slug already exists'),
                { status: 409 }
            )
        }

        const pg = await prisma.pG.create({
            data,
            include: { sector: true },
        })

        return NextResponse.json(
            success(pg, 'PG created successfully'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

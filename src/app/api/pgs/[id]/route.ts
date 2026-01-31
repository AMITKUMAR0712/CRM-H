import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgUpdateSchema } from '@/validators/pg.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import { apiRateLimiter } from '@/middleware/rateLimit'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/pgs/[id] - Get a single PG by ID or slug
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { id } = await params

        // Try to find by ID first, then by slug
        const pg = await prisma.pG.findFirst({
            where: {
                OR: [
                    { id },
                    { slug: id },
                ],
                isActive: true,
                approvalStatus: 'APPROVED',
            },
            include: {
                sector: true,
                amenities: { include: { amenity: true } },
                photos: { orderBy: { displayOrder: 'asc' } },
                categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
                reviews: {
                    where: { isApproved: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        })

        if (!pg) {
            return NextResponse.json(error('PG not found'), { status: 404 })
        }

        // Increment view count
        await prisma.pG.update({
            where: { id: pg.id },
            data: { viewCount: { increment: 1 } },
        })

        return NextResponse.json(success(pg))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/pgs/[id] - Update a PG (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const validation = await validateBody(req, pgUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Check if PG exists
        const existing = await prisma.pG.findFirst({
            where: {
                id,
                ...(authResult.user.role === 'MANAGER' ? { createdById: authResult.user.id } : {}),
            },
        })

        if (!existing) {
            return NextResponse.json(error('PG not found'), { status: 404 })
        }

        // Check slug uniqueness if being updated
        if (data.slug && data.slug !== existing.slug) {
            const slugExists = await prisma.pG.findUnique({
                where: { slug: data.slug },
            })

            if (slugExists) {
                return NextResponse.json(
                    error('A PG with this slug already exists'),
                    { status: 409 }
                )
            }
        }

        const { categoryIds, approvalStatus, blockedReason, ...pgData } = data

        const isApprovalUpdate = approvalStatus !== undefined || blockedReason !== undefined
        if (isApprovalUpdate && !hasPermission(authResult.user.role, PERMISSIONS.PG_APPROVE)) {
            return NextResponse.json(error('Insufficient permissions to approve or block PG listings'), { status: 403 })
        }

        const approvalPayload = isApprovalUpdate
            ? {
                  approvalStatus,
                  approvedAt: approvalStatus === 'APPROVED' ? new Date() : approvalStatus === 'PENDING' ? null : existing.approvedAt,
                  approvedById: approvalStatus ? authResult.user.id : existing.approvedById,
                  blockedReason: approvalStatus === 'BLOCKED' ? blockedReason ?? existing.blockedReason ?? 'Blocked by admin' : null,
              }
            : {}

        const pg = await prisma.pG.update({
            where: { id },
            data: {
                ...pgData,
                ...approvalPayload,
                categories: categoryIds
                    ? {
                          deleteMany: {},
                          create: categoryIds.map((categoryId) => ({ categoryId })),
                      }
                    : undefined,
            },
            include: { sector: true },
        })

        return NextResponse.json(success(pg, 'PG updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/pgs/[id] - Delete a PG (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.PG_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const existing = await prisma.pG.findFirst({
            where: {
                id,
                ...(authResult.user.role === 'MANAGER' ? { createdById: authResult.user.id } : {}),
            },
        })

        if (!existing) {
            return NextResponse.json(error('PG not found'), { status: 404 })
        }

        await prisma.pG.delete({
            where: { id },
        })

        return NextResponse.json(success(null, 'PG deleted successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

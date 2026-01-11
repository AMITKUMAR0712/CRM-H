import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgUpdateSchema } from '@/validators/pg.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requireAdmin, isAuthError } from '@/middleware/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/pgs/[id] - Get a single PG by ID or slug
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Try to find by ID first, then by slug
        const pg = await prisma.pG.findFirst({
            where: {
                OR: [
                    { id },
                    { slug: id },
                ],
                isActive: true,
            },
            include: {
                sector: true,
                amenities: { include: { amenity: true } },
                photos: { orderBy: { displayOrder: 'asc' } },
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
        const authResult = await requireAdmin()
        if (isAuthError(authResult)) return authResult

        const { id } = await params

        const validation = await validateBody(req, pgUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Check if PG exists
        const existing = await prisma.pG.findUnique({
            where: { id },
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

/**
 * DELETE /api/pgs/[id] - Delete a PG (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAdmin()
        if (isAuthError(authResult)) return authResult

        const { id } = await params

        const existing = await prisma.pG.findUnique({
            where: { id },
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

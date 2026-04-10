import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { categoryCreateSchema, categoryUpdateSchema } from '@/validators/blog.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/blog/categories - List all categories
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const categories = await prisma.category.findMany({
            where: { isActive: true },
            include: { _count: { select: { posts: true } } },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(success(categories))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/blog/categories - Create category (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, categoryCreateSchema)
        if (hasValidationError(validation)) return validation.error

        const existing = await prisma.category.findUnique({ where: { slug: validation.data.slug } })
        if (existing) return NextResponse.json(error('Category slug already exists'), { status: 409 })

        const category = await prisma.category.create({ data: validation.data })
        return NextResponse.json(success(category, 'Category created'), { status: 201 })
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/blog/categories - Update category (Admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Category ID required'), { status: 400 })

        const validation = await validateBody(req, categoryUpdateSchema)
        if (hasValidationError(validation)) return validation.error

        const category = await prisma.category.update({ where: { id }, data: validation.data })
        return NextResponse.json(success(category, 'Category updated'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/blog/categories - Delete category (Admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Category ID required'), { status: 400 })

        await prisma.category.delete({ where: { id } })
        return NextResponse.json(success(null, 'Category deleted'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

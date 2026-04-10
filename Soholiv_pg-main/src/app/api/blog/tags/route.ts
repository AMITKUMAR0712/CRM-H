import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { tagCreateSchema, tagUpdateSchema } from '@/validators/blog.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/blog/tags - List all tags
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const tags = await prisma.tag.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(success(tags))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/blog/tags - Create tag (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, tagCreateSchema)
        if (hasValidationError(validation)) return validation.error

        const existing = await prisma.tag.findUnique({ where: { slug: validation.data.slug } })
        if (existing) return NextResponse.json(error('Tag slug already exists'), { status: 409 })

        const tag = await prisma.tag.create({ data: validation.data })
        return NextResponse.json(success(tag, 'Tag created'), { status: 201 })
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/blog/tags - Delete tag (Admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json(error('Tag ID required'), { status: 400 })

        await prisma.tag.delete({ where: { id } })
        return NextResponse.json(success(null, 'Tag deleted'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

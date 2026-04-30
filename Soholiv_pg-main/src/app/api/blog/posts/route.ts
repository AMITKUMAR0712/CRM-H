import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { blogPostCreateSchema, blogPostQuerySchema } from '@/validators/blog.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma, PostStatus } from '@prisma/client'
import { apiRateLimiter } from '@/middleware/rateLimit'

/**
 * GET /api/blog/posts - List blog posts
 */
export async function GET(req: NextRequest) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { searchParams } = new URL(req.url)
        const validation = validateQuery(searchParams, blogPostQuerySchema)

        if (hasValidationError(validation)) {
            return validation.error
        }

        const query = validation.data
        const { page, limit, skip } = parsePagination(searchParams)

        // Build where clause - show only published posts for public
        const where: Prisma.BlogPostWhereInput = {
            status: PostStatus.PUBLISHED,
        }

        if (query.categoryId) where.categoryId = query.categoryId
        if (query.isFeatured === 'true') where.isFeatured = true

        if (query.search) {
            where.OR = [
                { title: { contains: query.search } },
                { content: { contains: query.search } },
                { excerpt: { contains: query.search } },
            ]
        }

        // Build orderBy
        const sortBy = query.sortBy || 'publishedAt'
        const sortOrder = query.sortOrder || 'desc'
        const orderBy = { [sortBy]: sortOrder } as Prisma.BlogPostOrderByWithRelationInput

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    featuredImage: true,
                    publishedAt: true,
                    readTime: true,
                    isFeatured: true,
                    viewCount: true,
                    category: { select: { name: true, slug: true } },
                    author: { select: { name: true, avatar: true } },
                    tags: { include: { tag: true } },
                },
                ...paginationQuery({ page, limit, skip }),
                orderBy,
            }),
            prisma.blogPost.count({ where }),
        ])

        return NextResponse.json(paginated(posts, page, limit, total))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * POST /api/blog/posts - Create a new blog post (Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const validation = await validateBody(req, blogPostCreateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const data = validation.data

        // Check if slug already exists
        const existing = await prisma.blogPost.findUnique({
            where: { slug: data.slug },
        })

        if (existing) {
            return NextResponse.json(
                error('A post with this slug already exists'),
                { status: 409 }
            )
        }

        // Create post
        const post = await prisma.blogPost.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                featuredImage: data.featuredImage,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                focusKeyword: data.focusKeyword,
                categoryId: data.categoryId,
                authorId: authResult.user.id,
                status: data.status,
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
                readTime: data.readTime,
                isFeatured: data.isFeatured,
            },
            include: {
                category: true,
                author: { select: { name: true } },
            },
        })

        // Connect tags if provided
        if (data.tagIds && data.tagIds.length > 0) {
            await prisma.postTag.createMany({
                data: data.tagIds.map(tagId => ({
                    postId: post.id,
                    tagId,
                })),
            })
        }

        return NextResponse.json(
            success(post, 'Blog post created successfully'),
            { status: 201 }
        )
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

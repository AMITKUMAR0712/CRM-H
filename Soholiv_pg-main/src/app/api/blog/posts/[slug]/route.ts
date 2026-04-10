import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { blogPostUpdateSchema } from '@/validators/blog.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { PostStatus } from '@prisma/client'
import { apiRateLimiter } from '@/middleware/rateLimit'

interface RouteParams {
    params: Promise<{ slug: string }>
}

/**
 * GET /api/blog/posts/[slug] - Get a single blog post
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const rateLimitResult = apiRateLimiter(req)
        if (rateLimitResult) return rateLimitResult

        const { slug } = await params

        const post = await prisma.blogPost.findFirst({
            where: {
                OR: [{ id: slug }, { slug }],
                status: PostStatus.PUBLISHED,
            },
            include: {
                category: true,
                author: { select: { name: true, avatar: true } },
                tags: { include: { tag: true } },
            },
        })

        if (!post) {
            return NextResponse.json(error('Post not found'), { status: 404 })
        }

        // Increment view count
        await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        })

        // Get related posts
        const relatedPosts = await prisma.blogPost.findMany({
            where: {
                status: PostStatus.PUBLISHED,
                id: { not: post.id },
                OR: [
                    { categoryId: post.categoryId },
                    { tags: { some: { tagId: { in: post.tags.map(t => t.tagId) } } } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                featuredImage: true,
                excerpt: true,
                publishedAt: true,
            },
            take: 4,
            orderBy: { publishedAt: 'desc' },
        })

        return NextResponse.json(success({
            ...post,
            relatedPosts,
        }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * PATCH /api/blog/posts/[slug] - Update a blog post (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { slug } = await params

        const validation = await validateBody(req, blogPostUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const existing = await prisma.blogPost.findFirst({
            where: { OR: [{ id: slug }, { slug }] },
        })

        if (!existing) {
            return NextResponse.json(error('Post not found'), { status: 404 })
        }

        const data = validation.data

        // Check slug uniqueness if being changed
        if (data.slug && data.slug !== existing.slug) {
            const slugExists = await prisma.blogPost.findUnique({
                where: { slug: data.slug },
            })
            if (slugExists) {
                return NextResponse.json(
                    error('A post with this slug already exists'),
                    { status: 409 }
                )
            }
        }

        // Set publishedAt if publishing for first time
        const publishedAt =
            data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED' && !existing.publishedAt
                ? new Date()
                : undefined

        const post = await prisma.blogPost.update({
            where: { id: existing.id },
            data: {
                ...data,
                publishedAt,
            },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        })

        // Update tags if provided
        if (data.tagIds) {
            await prisma.postTag.deleteMany({ where: { postId: post.id } })
            if (data.tagIds.length > 0) {
                await prisma.postTag.createMany({
                    data: data.tagIds.map(tagId => ({
                        postId: post.id,
                        tagId,
                    })),
                })
            }
        }

        return NextResponse.json(success(post, 'Post updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/blog/posts/[slug] - Delete a blog post (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.BLOG_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { slug } = await params

        const existing = await prisma.blogPost.findFirst({
            where: { OR: [{ id: slug }, { slug }] },
        })

        if (!existing) {
            return NextResponse.json(error('Post not found'), { status: 404 })
        }

        await prisma.blogPost.delete({
            where: { id: existing.id },
        })

        return NextResponse.json(success(null, 'Post deleted successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

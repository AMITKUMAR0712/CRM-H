import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, paginated, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { blogPostCreateSchema, blogPostQuerySchema } from '@/validators/blog.validator'
import { validateBody, validateQuery, hasValidationError } from '@/middleware/validation'
import { parsePagination, paginationQuery } from '@/utils/pagination'
import { Prisma, PostStatus } from '@prisma/client'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BLOG_READ)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const validation = validateQuery(searchParams, blogPostQuerySchema)
    if (hasValidationError(validation)) return validation.error

    const query = validation.data
    const { page, limit, skip } = parsePagination(searchParams)

    const where: Prisma.BlogPostWhereInput = {}

    if (query.status) where.status = query.status
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.isFeatured === 'true') where.isFeatured = true

    if (query.search) {
      where.OR = [{ title: { contains: query.search } }, { excerpt: { contains: query.search } }]
    }

    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    const orderBy = { [sortBy]: sortOrder } as Prisma.BlogPostOrderByWithRelationInput

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true, email: true } },
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

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const validation = await validateBody(req, blogPostCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json(error('A blog post with this slug already exists'), { status: 409 })

    if (data.status === PostStatus.PUBLISHED && !hasPermission(authResult.user.role, PERMISSIONS.BLOG_PUBLISH)) {
      return NextResponse.json(error('Insufficient permissions to publish blog posts'), { status: 403 })
    }

    const publishedAt =
      data.status === PostStatus.PUBLISHED
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : null

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
        publishedAt,
        readTime: data.readTime,
        isFeatured: data.isFeatured,
      },
    })

    return NextResponse.json(success(post, 'Blog post created successfully'), { status: 201 })
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

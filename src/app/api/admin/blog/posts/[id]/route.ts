import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { blogPostUpdateSchema } from '@/validators/blog.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import { UserRole } from '@prisma/client'
import { PostStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BLOG_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    })

    if (!post) return NextResponse.json(error('Post not found'), { status: 404 })

    return NextResponse.json(success(post))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BLOG_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, blogPostUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Post not found'), { status: 404 })

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({ where: { slug: data.slug } })
      if (slugExists) return NextResponse.json(error('A blog post with this slug already exists'), { status: 409 })
    }

    if (data.status === PostStatus.PUBLISHED && !hasPermission(authResult.user.role, PERMISSIONS.BLOG_PUBLISH)) {
      return NextResponse.json(error('Insufficient permissions to publish blog posts'), { status: 403 })
    }

    const publishedAt =
      data.status === PostStatus.PUBLISHED
        ? existing.publishedAt ?? new Date()
        : data.status === PostStatus.DRAFT
          ? null
          : existing.publishedAt

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
      },
    })

    return NextResponse.json(success(post, 'Blog post updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.BLOG_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Post not found'), { status: 404 })

    if (authResult.user.role === UserRole.MANAGER && existing.status === PostStatus.PUBLISHED) {
      return NextResponse.json(error('Managers cannot delete published posts'), { status: 403 })
    }

    await prisma.blogPost.delete({ where: { id } })

    return NextResponse.json(success(null, 'Blog post deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { pgUpdateSchema } from '@/validators/pg.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import type { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params
    const assignmentsInclude =
      authResult.user.role === 'MANAGER'
        ? { where: { userId: authResult.user.id }, include: { user: { select: { id: true, name: true, email: true } } } }
        : { include: { user: { select: { id: true, name: true, email: true } } } }

    const pg = await prisma.pG.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(authResult.user.role === 'MANAGER'
          ? { assignments: { some: { userId: authResult.user.id } } }
          : {}),
      },
      include: {
        sector: true,
        amenities: { include: { amenity: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        assignments: assignmentsInclude,
      } as unknown as Prisma.PGInclude,
    })

    if (!pg) return NextResponse.json(error('PG not found'), { status: 404 })

    return NextResponse.json(success(pg))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, pgUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    const existing = (await prisma.pG.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER'
          ? { assignments: { some: { userId: authResult.user.id } } }
          : {}),
      },
    })) as unknown as {
      id: string
      slug: string
      approvedAt: Date | null
      approvedById: string | null
      blockedReason: string | null
      createdById?: string | null
    }
    if (!existing) return NextResponse.json(error('PG not found'), { status: 404 })

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.pG.findUnique({ where: { slug: data.slug } })
      if (slugExists) return NextResponse.json(error('A PG with this slug already exists'), { status: 409 })
    }

    const { categoryIds, approvalStatus, blockedReason, assignedManagerIds, ...pgData } = data

    const isSuperAdmin = authResult.user.role === 'SUPER_ADMIN'
    let assignments: Record<string, unknown> | undefined

    if (assignedManagerIds) {
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

      assignments = {
        deleteMany: {},
        create: managers.map((m) => ({ userId: m.id })),
      }
    }

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

    if (categoryIds && !isSuperAdmin) {
      return NextResponse.json(error('Insufficient permissions to manage categories'), { status: 403 })
    }

    const updateData = {
      ...pgData,
      ...approvalPayload,
      categories: categoryIds
        ? {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        }
        : undefined,
      assignments,
    }

    const pg = await prisma.pG.update({
      where: { id },
      data: updateData as unknown as Prisma.PGUpdateInput,
      include: { sector: true },
    })

    return NextResponse.json(success(pg, 'PG updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.PG_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    if (authResult.user.role === 'MANAGER') {
      return NextResponse.json(error('Insufficient permissions to delete PGs'), { status: 403 })
    }

    if (authResult.user.role === 'ADMIN') {
      const existing = await prisma.pG.findUnique({
        where: { id },
        select: { id: true, createdById: true },
      })
      if (!existing) return NextResponse.json(error('PG not found'), { status: 404 })
      if (existing.createdById !== authResult.user.id) {
        return NextResponse.json(error('Insufficient permissions to delete this PG'), { status: 403 })
      }

      await prisma.pG.delete({ where: { id } })
      return NextResponse.json(success(null, 'PG deleted successfully'))
    }

    const existing = await prisma.pG.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json(error('PG not found'), { status: 404 })

    await prisma.pG.delete({ where: { id } })

    return NextResponse.json(success(null, 'PG deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

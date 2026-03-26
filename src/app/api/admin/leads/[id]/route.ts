import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { leadUpdateSchema } from '@/validators/lead.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LEAD_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        preferredSector: { select: { id: true, name: true, slug: true } },
        pg: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: {
          include: {
            performedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(error('Lead not found'), { status: 404 })
    }

    return NextResponse.json(success(lead))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LEAD_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, leadUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const data = validation.data

    // Check if lead exists (with role-based filtering for managers)
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
    })
    if (!existingLead) return NextResponse.json(error('Lead not found'), { status: 404 })

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        lastContactedAt: new Date(),
      },
      include: {
        preferredSector: { select: { id: true, name: true, slug: true } },
        pg: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    // Create activity log for status change
    if (data.status && data.status !== existingLead.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'STATUS_CHANGE',
          description: `Status changed from ${existingLead.status} to ${data.status}`,
          performedById: authResult.user.id,
        },
      })
    }

    // Create activity log for assignment
    if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'NOTE',
          description: `Lead assigned to user`,
          performedById: authResult.user.id,
        },
      })
    }

    return NextResponse.json(success(updatedLead, 'Lead updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LEAD_DELETE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({ where: { id } })
    if (!existingLead) {
      return NextResponse.json(error('Lead not found'), { status: 404 })
    }

    // Delete lead (cascade will delete activities)
    await prisma.lead.delete({ where: { id } })

    return NextResponse.json(success(null, 'Lead deleted successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

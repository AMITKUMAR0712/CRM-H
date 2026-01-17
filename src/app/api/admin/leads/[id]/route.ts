import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { leadUpdateSchema } from '@/validators/lead.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.LEAD_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, leadUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const existing = await prisma.lead.findUnique({ where: { id } })
    if (!existing) return NextResponse.json(error('Lead not found'), { status: 404 })

    const data = validation.data

    if (
      data.assignedToId !== undefined &&
      data.assignedToId !== existing.assignedToId &&
      !hasPermission(authResult.user.role, PERMISSIONS.LEAD_ASSIGN)
    ) {
      return NextResponse.json(error('Insufficient permissions to assign lead'), { status: 403 })
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        lastContactedAt: new Date(),
      },
      include: {
        preferredSector: true,
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    if (data.status && data.status !== existing.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'STATUS_CHANGE',
          description: `Status changed from ${existing.status} to ${data.status}`,
          performedById: authResult.user.id,
        },
      })
    }

    if (data.assignedToId && data.assignedToId !== existing.assignedToId) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'NOTE',
          description: `Lead assigned to user ${data.assignedToId}`,
          performedById: authResult.user.id,
        },
      })
    }

    return NextResponse.json(success(lead, 'Lead updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error, success } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS, hasPermission } from '@/lib/rbac'
import { enquiryUpdateSchema, enquiryNoteCreateSchema } from '@/validators/enquiry.validator'
import { logAudit } from '@/lib/audit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.ENQUIRY_READ)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const enquiry = await prisma.enquiry.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        notes: {
          orderBy: { createdAt: 'asc' },
          include: { createdBy: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (!enquiry) return NextResponse.json(error('Enquiry not found'), { status: 404 })

    return NextResponse.json(success(enquiry))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.ENQUIRY_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const validation = await validateBody(req, enquiryUpdateSchema)
    if (hasValidationError(validation)) return validation.error

    const existing = await prisma.enquiry.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
    })
    if (!existing) return NextResponse.json(error('Enquiry not found'), { status: 404 })

    const data = validation.data

    if (
      data.assignedToId !== undefined &&
      data.assignedToId !== existing.assignedToId &&
      !hasPermission(authResult.user.role, PERMISSIONS.ENQUIRY_ASSIGN)
    ) {
      return NextResponse.json(error('Insufficient permissions to assign enquiry'), { status: 403 })
    }

    if (data.status === 'CLOSED' && !hasPermission(authResult.user.role, PERMISSIONS.ENQUIRY_CLOSE)) {
      return NextResponse.json(error('Insufficient permissions to close enquiry'), { status: 403 })
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: data.status,
        assignedToId: data.assignedToId === undefined ? undefined : data.assignedToId,
        resolvedAt:
          data.status === 'RESOLVED'
            ? existing.resolvedAt ?? new Date()
            : data.status === 'IN_PROGRESS'
              ? null
              : existing.resolvedAt,
        closedAt: data.status === 'CLOSED' ? existing.closedAt ?? new Date() : existing.closedAt,
      },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'enquiry.update',
      entityType: 'Enquiry',
      entityId: id,
      summary: `Updated enquiry ${id}`,
      metadata: { from: { status: existing.status, assignedToId: existing.assignedToId }, to: data },
    })

    return NextResponse.json(success(updated, 'Enquiry updated successfully'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(PERMISSIONS.ENQUIRY_WRITE)
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    const existing = await prisma.enquiry.findFirst({
      where: {
        id,
        ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
      },
    })
    if (!existing) return NextResponse.json(error('Enquiry not found'), { status: 404 })

    const validation = await validateBody(req, enquiryNoteCreateSchema)
    if (hasValidationError(validation)) return validation.error

    const note = await prisma.enquiryNote.create({
      data: {
        enquiryId: id,
        body: validation.data.body,
        isInternal: validation.data.isInternal ?? true,
        createdById: authResult.user.id,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })

    await logAudit({
      actorId: authResult.user.id,
      actorRole: authResult.user.role,
      action: 'enquiry.note.create',
      entityType: 'Enquiry',
      entityId: id,
      summary: `Added enquiry note ${note.id}`,
    })

    return NextResponse.json(success(note, 'Note added'))
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

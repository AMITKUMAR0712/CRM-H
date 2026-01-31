import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { leadUpdateSchema } from '@/validators/lead.validator'
import { validateBody, hasValidationError } from '@/middleware/validation'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/leads/[id] - Get a single lead (Admin only)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_READ)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const lead = await prisma.lead.findFirst({
            where: {
                id,
                ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
            },
            include: {
                preferredSector: true,
                pg: { select: { name: true, slug: true, sectorId: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        performedBy: { select: { name: true } },
                    },
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

/**
 * PATCH /api/leads/[id] - Update a lead (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_WRITE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const validation = await validateBody(req, leadUpdateSchema)
        if (hasValidationError(validation)) {
            return validation.error
        }

        const existing = await prisma.lead.findFirst({
            where: {
                id,
                ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
            },
        })

        if (!existing) {
            return NextResponse.json(error('Lead not found'), { status: 404 })
        }

        const data = validation.data

        // Update lead
        const lead = await prisma.lead.update({
            where: { id },
            data: {
                ...data,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                lastContactedAt: new Date(),
            },
            include: {
                preferredSector: true,
                assignedTo: { select: { name: true, email: true } },
            },
        })

        // Log activity if status changed
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

        return NextResponse.json(success(lead, 'Lead updated successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

/**
 * DELETE /api/leads/[id] - Delete a lead (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_DELETE)
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        const existing = await prisma.lead.findFirst({
            where: {
                id,
                ...(authResult.user.role === 'MANAGER' ? { assignedToId: authResult.user.id } : {}),
            },
        })

        if (!existing) {
            return NextResponse.json(error('Lead not found'), { status: 404 })
        }

        await prisma.lead.delete({
            where: { id },
        })

        return NextResponse.json(success(null, 'Lead deleted successfully'))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

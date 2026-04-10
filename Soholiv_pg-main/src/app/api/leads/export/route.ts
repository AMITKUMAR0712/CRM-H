import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { error } from '@/utils/apiResponse'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'

/**
 * GET /api/leads/export - Export leads as CSV (Admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_EXPORT)
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(req.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const status = searchParams.get('status')

        // Build where clause
        const where: Record<string, unknown> = {}

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
            if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
        }
        if (status) where.status = status

        const leads = await prisma.lead.findMany({
            where,
            include: {
                preferredSector: { select: { name: true } },
                pg: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        // Build CSV
        const headers = ['Name', 'Phone', 'Email', 'Sector', 'Budget Min', 'Budget Max', 'Room Type', 'Status', 'Source', 'Created At']
        const rows = leads.map(lead => [
            lead.name,
            lead.phone,
            lead.email || '',
            lead.preferredSector?.name || '',
            lead.budgetMin?.toString() || '',
            lead.budgetMax?.toString() || '',
            lead.roomType || '',
            lead.status,
            lead.source || '',
            lead.createdAt.toISOString(),
        ])

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (err) {
        console.error('Export error:', err)
        return NextResponse.json(error('Export failed'), { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

/**
 * GET /api/leads/stats - Get lead statistics (Admin only)
 */
export async function GET() {
    try {
        const authResult = await requirePermission(PERMISSIONS.LEAD_READ)
        if (authResult instanceof NextResponse) return authResult

        const assignedFilter = {}
        const assignedSql = Prisma.empty

        // Get date ranges
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Run all queries in parallel
        const [
            totalLeads,
            thisMonthLeads,
            lastMonthLeads,
            newLeads,
            convertedLeads,
            leadsByStatus,
            leadsByDay,
            topSectors,
        ] = await Promise.all([
            // Total leads
            prisma.lead.count({ where: assignedFilter }),

            // This month
            prisma.lead.count({
                where: { ...assignedFilter, createdAt: { gte: startOfMonth } },
            }),

            // Last month
            prisma.lead.count({
                where: {
                    ...assignedFilter,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),

            // New (uncontacted)
            prisma.lead.count({
                where: { ...assignedFilter, status: 'NEW' },
            }),

            // Converted
            prisma.lead.count({
                where: { ...assignedFilter, status: 'CONVERTED' },
            }),

            // By status
            prisma.lead.groupBy({
                by: ['status'],
                where: assignedFilter,
                _count: true,
            }),

            // Last 30 days by day
            prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM leads
        WHERE createdAt >= ${thirtyDaysAgo}
                ${assignedSql}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,

            // Top sectors
            prisma.lead.groupBy({
                by: ['preferredSectorId'],
                where: { ...assignedFilter, preferredSectorId: { not: null } },
                _count: true,
                orderBy: { _count: { preferredSectorId: 'desc' } },
                take: 5,
            }),
        ])

        // Get sector names
        const sectorIds = topSectors.map(s => s.preferredSectorId).filter(Boolean) as string[]
        const sectors = await prisma.sector.findMany({
            where: { id: { in: sectorIds } },
            select: { id: true, name: true },
        })

        const topSectorsWithNames = topSectors.map(s => ({
            sectorId: s.preferredSectorId,
            sectorName: sectors.find(sec => sec.id === s.preferredSectorId)?.name || 'Unknown',
            count: s._count,
        }))

        // Calculate growth
        const monthlyGrowth = lastMonthLeads > 0
            ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100)
            : thisMonthLeads > 0 ? 100 : 0

        return NextResponse.json(success({
            summary: {
                total: totalLeads,
                thisMonth: thisMonthLeads,
                lastMonth: lastMonthLeads,
                monthlyGrowth,
                new: newLeads,
                converted: convertedLeads,
                conversionRate: totalLeads > 0
                    ? Math.round((convertedLeads / totalLeads) * 100)
                    : 0,
            },
            byStatus: leadsByStatus.reduce((acc, item) => {
                acc[item.status] = item._count
                return acc
            }, {} as Record<string, number>),
            byDay: leadsByDay.map(item => ({
                date: item.date,
                count: Number(item.count),
            })),
            topSectors: topSectorsWithNames,
        }))
    } catch (err) {
        const { statusCode, message } = handleError(err)
        return NextResponse.json(error(message), { status: statusCode })
    }
}

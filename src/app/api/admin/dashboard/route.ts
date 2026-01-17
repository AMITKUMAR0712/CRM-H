import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleError } from '@/utils/errors'
import { error, success } from '@/utils/apiResponse'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const authResult = await requirePermission(PERMISSIONS.DASHBOARD_VIEW)
    if (authResult instanceof NextResponse) return authResult

    const [
      totalPgs,
      activePgs,
      featuredPgs,
      totalLeads,
      leadsByStatus,
      sectorCounts,
      estimatedRevenueRows,
      leadsByDay,
      recentLeadActivities,
      recentLeads,
    ] = await Promise.all([
      prisma.pG.count(),
      prisma.pG.count({ where: { isActive: true } }),
      prisma.pG.count({ where: { isFeatured: true, isActive: true } }),
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.pG.groupBy({
        by: ['sectorId'],
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ estimatedRevenue: number | null }[]>(Prisma.sql`
        SELECT SUM(monthlyRent * GREATEST(totalRooms - availableRooms, 0)) AS estimatedRevenue
        FROM pgs
        WHERE isActive = 1
      `),
      prisma.$queryRaw<{ day: string; count: bigint }[]>(Prisma.sql`
        SELECT DATE(createdAt) as day, COUNT(*) as count
        FROM leads
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `),
      prisma.leadActivity.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: { select: { id: true, name: true } },
          performedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          status: true,
          priority: true,
          createdAt: true,
          preferredSector: { select: { name: true } },
        },
      }),
    ])

    const sectorIds = sectorCounts.map((s) => s.sectorId)
    const sectors = await prisma.sector.findMany({
      where: { id: { in: sectorIds } },
      select: { id: true, name: true, slug: true },
    })
    const sectorById = new Map(sectors.map((s) => [s.id, s]))

    const sectorDistribution = sectorCounts
      .map((row) => ({
        sectorId: row.sectorId,
        sectorName: sectorById.get(row.sectorId)?.name ?? 'Unknown',
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count)

    const funnel = leadsByStatus
      .map((row) => ({ status: row.status, count: row._count._all }))
      .sort((a, b) => a.status.localeCompare(b.status))

    const estimatedMonthlyRevenue = Number(estimatedRevenueRows?.[0]?.estimatedRevenue ?? 0)

    const leadsSeries = leadsByDay.map((row) => ({
      day: row.day,
      count: Number(row.count),
    }))

    return NextResponse.json(
      success({
        totals: {
          totalPgs,
          activePgs,
          featuredPgs,
          totalLeads,
          estimatedMonthlyRevenue,
        },
        leadsSeries,
        sectorDistribution,
        funnel,
        recent: {
          leadActivities: recentLeadActivities,
          leads: recentLeads,
        },
      })
    )
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

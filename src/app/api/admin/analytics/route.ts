import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { success, error } from '@/utils/apiResponse'
import { handleError } from '@/utils/errors'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

function parseRange(range: string | null) {
  if (!range) return 30
  const match = range.match(/^(\d+)(d)$/)
  if (!match) return 30
  const days = parseInt(match[1], 10)
  return Number.isNaN(days) ? 30 : Math.min(Math.max(days, 7), 365)
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission(PERMISSIONS.ANALYTICS_VIEW)
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(req.url)
    const range = parseRange(searchParams.get('range'))

    const [
      totalUsers,
      totalPgs,
      pendingPgs,
      approvedPgs,
      blockedPgs,
      totalLeads,
      totalEnquiries,
      occupancyRows,
      topPages,
      enquiriesByDay,
      leadsByDay,
      pageViewsByDay,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.pG.count().catch(() => 0),
      prisma.pG.count({ where: { approvalStatus: 'PENDING' } }).catch(() => 0),
      prisma.pG.count({ where: { approvalStatus: 'APPROVED' } }).catch(() => 0),
      prisma.pG.count({ where: { approvalStatus: 'BLOCKED' } }).catch(() => 0),
      prisma.lead.count().catch(() => 0),
      prisma.enquiry.count().catch(() => 0),
      prisma.$queryRaw<{ totalRooms: number | null; occupiedRooms: number | null }[]>(Prisma.sql`
        SELECT COALESCE(SUM(totalRooms), 0) AS totalRooms,
               COALESCE(SUM(GREATEST(totalRooms - availableRooms, 0)), 0) AS occupiedRooms
        FROM pgs
        WHERE isActive = 1
      `).catch(() => [{ totalRooms: 0, occupiedRooms: 0 }]),
      prisma.$queryRaw<{ path: string; count: bigint }[]>(Prisma.sql`
        SELECT path, COUNT(*) AS count
        FROM page_views
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ${range - 1} DAY)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 10
      `).catch(() => []),
      prisma.$queryRaw<{ day: string; count: bigint }[]>(Prisma.sql`
        SELECT DATE(createdAt) as day, COUNT(*) as count
        FROM enquiries
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ${range - 1} DAY)
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `).catch(() => []),
      prisma.$queryRaw<{ day: string; count: bigint }[]>(Prisma.sql`
        SELECT DATE(createdAt) as day, COUNT(*) as count
        FROM leads
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ${range - 1} DAY)
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `).catch(() => []),
      prisma.$queryRaw<{ day: string; count: bigint }[]>(Prisma.sql`
        SELECT DATE(createdAt) as day, COUNT(*) as count
        FROM page_views
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ${range - 1} DAY)
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `).catch(() => []),
    ])

    const totalRooms = Number(occupancyRows?.[0]?.totalRooms ?? 0)
    const occupiedRooms = Number(occupancyRows?.[0]?.occupiedRooms ?? 0)
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return NextResponse.json(
      success({
        range,
        totals: {
          totalUsers,
          totalPgs,
          totalLeads,
          totalEnquiries,
          pendingPgs,
          approvedPgs,
          blockedPgs,
          occupancyRate,
        },
        series: {
          enquiries: enquiriesByDay.map((row) => ({ day: row.day, count: Number(row.count) })),
          leads: leadsByDay.map((row) => ({ day: row.day, count: Number(row.count) })),
          pageViews: pageViewsByDay.map((row) => ({ day: row.day, count: Number(row.count) })),
        },
        topPages: topPages.map((row) => ({ path: row.path, count: Number(row.count) })),
      })
    )
  } catch (err) {
    console.error('Analytics API Error:', err)
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

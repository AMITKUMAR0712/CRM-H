import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleError } from '@/utils/errors'
import { error, success } from '@/utils/apiResponse'
import { requirePermission } from '@/middleware/permissions'
import { PERMISSIONS } from '@/lib/rbac'
import { Prisma, UserRole } from '@prisma/client'
import type { AuthSession } from '@/middleware/auth'

type DashboardCard = {
  id: string
  title: string
  value: number | string
  subtitle?: string
}

type DashboardChart = {
  id: string
  title: string
  type: 'line' | 'bar'
  data: { label: string; value: number }[]
}

type DashboardList = {
  id: string
  title: string
  items: Array<{ title: string; subtitle?: string; meta?: string }>
}

export async function GET() {
  try {
    const authResult = await requirePermission(PERMISSIONS.DASHBOARD_VIEW)
    if (authResult instanceof NextResponse) return authResult

    const session = authResult as AuthSession
    const role = session.user.role
    const userId = session.user.id

    const cards: DashboardCard[] = []
    const charts: DashboardChart[] = []
    const lists: DashboardList[] = []

    const [totalPgs, activePgs] = await Promise.all([
      prisma.pG.count(),
      prisma.pG.count({ where: { isActive: true } }),
    ])

    if (role !== UserRole.USER) {
      const [
        totalLeads,
        totalEnquiries,
        pendingPgs,
        usersByRole,
        sectorCounts,
        occupancyRows,
        enquiriesByMonth,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.lead.count().catch(() => 0),
        prisma.enquiry.count().catch(() => 0),
        prisma.pG.count({ where: { isActive: false } }).catch(() => 0),
        prisma.user.groupBy({ by: ['role'], _count: { _all: true } }).catch(() => []),
        prisma.pG.groupBy({ by: ['sectorId'], _count: { _all: true } }).catch(() => []),
        prisma.$queryRaw<{ totalRooms: number | null; occupiedRooms: number | null }[]>(Prisma.sql`
          SELECT SUM(totalRooms) AS totalRooms,
                 SUM(GREATEST(totalRooms - availableRooms, 0)) AS occupiedRooms
          FROM pgs
          WHERE isActive = 1
        `).catch(() => []),
        prisma.$queryRaw<{ month: string; count: bigint }[]>(Prisma.sql`
          SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS count
          FROM enquiries
          WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
          GROUP BY month
          ORDER BY month ASC
        `).catch(() => []),
        prisma.auditLog.findMany({
          take: 12,
          orderBy: { createdAt: 'desc' },
          select: { action: true, entityType: true, summary: true, createdAt: true, actor: { select: { name: true } } },
        }).catch(() => []),
      ])

      const roleCountMap = new Map(usersByRole.map((r) => [r.role, r._count._all]))
      const totalUsers = Array.from(roleCountMap.values()).reduce((sum, v) => sum + v, 0)
      const totalAdmins = (roleCountMap.get(UserRole.ADMIN) ?? 0) + (roleCountMap.get(UserRole.SUPER_ADMIN) ?? 0)
      const totalManagers = roleCountMap.get(UserRole.MANAGER) ?? 0
      const totalViewers = roleCountMap.get(UserRole.VIEWER) ?? 0

      const totalRooms = Number(occupancyRows?.[0]?.totalRooms ?? 0)
      const occupiedRooms = Number(occupancyRows?.[0]?.occupiedRooms ?? 0)
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

      cards.push(
        { id: 'pgs', title: 'Total PGs', value: totalPgs, subtitle: `Active: ${activePgs} • Pending: ${pendingPgs}` },
        { id: 'users', title: 'Total Users', value: totalUsers, subtitle: `Admins: ${totalAdmins} • Managers: ${totalManagers} • Viewers: ${totalViewers}` },
        { id: 'enquiries', title: 'Total Enquiries', value: totalEnquiries },
        { id: 'leads', title: 'Total Leads', value: totalLeads },
        { id: 'occupancy', title: 'Occupancy Rate', value: `${occupancyRate}%`, subtitle: `${occupiedRooms}/${totalRooms} rooms occupied` }
      )

      const sectorIds = sectorCounts.map((s) => s.sectorId)
      const sectors = await prisma.sector.findMany({
        where: { id: { in: sectorIds } },
        select: { id: true, name: true },
      })
      const sectorById = new Map(sectors.map((s) => [s.id, s.name]))

      charts.push(
        {
          id: 'enquiries-monthly',
          title: 'Monthly Enquiries (6M)',
          type: 'line',
          data: enquiriesByMonth.map((row) => ({ label: row.month, value: Number(row.count) })),
        },
        {
          id: 'sectors',
          title: 'Sector-wise PG Distribution',
          type: 'bar',
          data: sectorCounts.map((row) => ({
            label: sectorById.get(row.sectorId) ?? 'Unknown',
            value: row._count._all,
          })),
        }
      )

      lists.push({
        id: 'audit',
        title: 'Recent Audit Logs',
        items: recentAuditLogs.map((log) => ({
          title: `${log.action} • ${log.entityType}`,
          subtitle: log.summary ?? undefined,
          meta: log.actor?.name ?? 'System',
        })),
      })
    }

    if (role === UserRole.USER) {
      const [userEnquiries, userTickets] = await Promise.all([
        prisma.enquiry.count({ where: { userId } }),
        prisma.ticket.count({ where: { userId } }),
      ])

      cards.push(
        { id: 'my-enquiries', title: 'My Enquiries', value: userEnquiries },
        { id: 'my-tickets', title: 'My Tickets', value: userTickets }
      )
    }
    return NextResponse.json(
      success({
        role,
        cards,
        charts,
        lists,
      })
    )
  } catch (err) {
    const { statusCode, message } = handleError(err)
    return NextResponse.json(error(message), { status: statusCode })
  }
}

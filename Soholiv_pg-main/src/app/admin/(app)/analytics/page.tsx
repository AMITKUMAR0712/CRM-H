'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const RANGES = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '365 days', value: '365d' },
]

type AnalyticsResponse = {
  range: number
  totals: {
    totalUsers: number
    totalPgs: number
    totalLeads: number
    totalEnquiries: number
    pendingPgs: number
    approvedPgs: number
    blockedPgs: number
    occupancyRate: number
  }
  series: {
    enquiries: Array<{ day: string; count: number }>
    leads: Array<{ day: string; count: number }>
    pageViews: Array<{ day: string; count: number }>
  }
  topPages: Array<{ path: string; count: number }>
}

type ApiResponse<T> = { success: boolean; data?: T; error?: string; message?: string }

export default function AnalyticsPage() {
  const [range, setRange] = React.useState('30d')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-analytics', range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<AnalyticsResponse>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load analytics')
      return json.data as AnalyticsResponse
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{(error as Error)?.message || 'Failed to load analytics'}</p>
        </CardContent>
      </Card>
    )
  }

  function exportCsv() {
    if (!data) return

    const totalsRows = [
      ['Metric', 'Value'],
      ['Total Users', data.totals.totalUsers],
      ['Total PGs', data.totals.totalPgs],
      ['Approved PGs', data.totals.approvedPgs],
      ['Pending PGs', data.totals.pendingPgs],
      ['Blocked PGs', data.totals.blockedPgs],
      ['Total Enquiries', data.totals.totalEnquiries],
      ['Total Leads', data.totals.totalLeads],
      ['Occupancy Rate', `${data.totals.occupancyRate}%`],
    ]

    const days = new Set<string>()
    data.series.enquiries.forEach((row) => days.add(row.day))
    data.series.leads.forEach((row) => days.add(row.day))
    data.series.pageViews.forEach((row) => days.add(row.day))

    const dayList = Array.from(days).sort()
    const enquiriesMap = new Map(data.series.enquiries.map((row) => [row.day, row.count]))
    const leadsMap = new Map(data.series.leads.map((row) => [row.day, row.count]))
    const pageViewsMap = new Map(data.series.pageViews.map((row) => [row.day, row.count]))

    const seriesRows = [
      ['Day', 'Enquiries', 'Leads', 'Page Views'],
      ...dayList.map((day) => [
        day,
        enquiriesMap.get(day) ?? 0,
        leadsMap.get(day) ?? 0,
        pageViewsMap.get(day) ?? 0,
      ]),
    ]

    const topPagesRows = [
      ['Path', 'Views'],
      ...data.topPages.map((row) => [row.path, row.count]),
    ]

    const sections = [
      ['Totals'],
      ...totalsRows,
      [''],
      ['Daily Series'],
      ...seriesRows,
      [''],
      ['Top Pages'],
      ...topPagesRows,
    ]

    const csv = sections
      .map((cols) => cols.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted">System-wide metrics for executive monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((item) => (
            <Button
              key={item.value}
              variant={range === item.value ? 'default' : 'outline'}
              onClick={() => setRange(item.value)}
            >
              {item.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Total PGs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.totalPgs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">PGs (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.approvedPgs}</div>
            <div className="text-xs text-muted">
              Pending: {data.totals.pendingPgs} • Blocked: {data.totals.blockedPgs}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Total Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.totalEnquiries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.totals.occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enquiries</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series.enquiries} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <XAxis dataKey="day" hide />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={2} stroke="var(--color-clay)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series.leads} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <XAxis dataKey="day" hide />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={2} stroke="var(--color-olive)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series.pageViews} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <XAxis dataKey="day" hide />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={2} stroke="var(--color-graphite)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-(--color-border)">
                  <th className="py-2">Path</th>
                  <th className="py-2">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((row) => (
                  <tr key={row.path} className="border-b border-(--color-border)">
                    <td className="py-2 truncate max-w-60">{row.path}</td>
                    <td className="py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

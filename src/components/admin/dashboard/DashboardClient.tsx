'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardData = {
    totals: {
      totalPgs: number
      activePgs: number
      featuredPgs: number
      totalLeads: number
      estimatedMonthlyRevenue: number
    }
    leadsSeries: { day: string; count: number }[]
    sectorDistribution: { sectorId: string; sectorName: string; count: number }[]
    funnel: { status: string; count: number }[]
    recent: {
      leadActivities: Array<{
        id: string
        activityType: string
        description: string
        createdAt: string
        lead: { id: string; name: string }
        performedBy: { id: string; name: string } | null
      }>
      leads: Array<{
        id: string
        name: string
        phone: string
        status: string
        priority: string
        createdAt: string
        preferredSector: { name: string } | null
      }>
    }
}

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export default function DashboardClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<DashboardData>

      if (!res.ok || !json.success) {
        throw new Error('error' in json ? json.error : 'Failed to load dashboard')
      }

      return json.data
    },
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{(error as Error)?.message || 'Failed to load dashboard'}</p>
        </CardContent>
      </Card>
    )
  }

  const totals = data.totals

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">Core operational metrics and CRM activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">Total PGs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totals.totalPgs}</div>
            <div className="text-xs text-[var(--color-muted)]">Active: {totals.activePgs} • Featured: {totals.featuredPgs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totals.totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">Estimated Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatINR(totals.estimatedMonthlyRevenue)}</div>
            <div className="text-xs text-[var(--color-muted)]">Computed as rent × occupied rooms (totalRooms - availableRooms).</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--color-muted)]">Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data.sectorDistribution.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Leads (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.leadsSeries} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
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
            <CardTitle>Sector-wise PG Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sectorDistribution} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sectorName" tick={{ fontSize: 12 }} interval={0} angle={-20} height={60} />
                <YAxis allowDecimals={false} width={32} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-clay)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.funnel.map((row) => (
              <div key={row.status} className="flex items-center justify-between text-sm">
                <div className="text-[var(--color-muted)]">{row.status}</div>
                <div className="font-medium">{row.count}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recent.leadActivities.map((a) => (
              <div key={a.id} className="text-sm">
                <div className="font-medium">{a.activityType}</div>
                <div className="text-[var(--color-muted)]">{a.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

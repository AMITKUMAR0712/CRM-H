'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'
import type { UserRole } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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

type DashboardData = {
  role: UserRole
  cards: DashboardCard[]
  charts: DashboardChart[]
  lists: DashboardList[]
}

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

function formatValue(value: number | string) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-IN').format(value)
  }
  return value
}

function titleForRole(role: UserRole) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin Dashboard'
    case 'ADMIN':
      return 'Admin Dashboard'
    case 'MANAGER':
      return 'Manager Dashboard'
    case 'VIEWER':
      return 'Viewer Dashboard'
    default:
      return 'Dashboard'
  }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{titleForRole(data.role)}</h1>
        <p className="text-sm text-muted">Role-aligned operational metrics and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {data.cards.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{formatValue(card.value)}</div>
              {card.subtitle ? <div className="text-xs text-muted">{card.subtitle}</div> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {data.charts.length ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.charts.map((chart) => (
            <Card key={chart.id}>
              <CardHeader>
                <CardTitle>{chart.title}</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'line' ? (
                    <LineChart data={chart.data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <XAxis dataKey="label" hide />
                      <YAxis allowDecimals={false} width={32} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" strokeWidth={2} stroke="var(--color-clay)" dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={chart.data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} height={60} />
                      <YAxis allowDecimals={false} width={32} />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-clay)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {data.lists.length ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.lists.map((list) => (
            <Card key={list.id}>
              <CardHeader>
                <CardTitle>{list.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.items.length ? (
                  list.items.map((item, idx) => (
                    <div key={`${list.id}-${idx}`} className="text-sm">
                      <div className="font-medium">{item.title}</div>
                      {item.subtitle ? <div className="text-muted">{item.subtitle}</div> : null}
                      {item.meta ? <div className="text-xs text-muted mt-1">{item.meta}</div> : null}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted">No recent items.</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}

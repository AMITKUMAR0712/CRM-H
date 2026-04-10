'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'



type PgRow = {
  id: string
  name: string
  slug: string
  monthlyRent: number
  isActive: boolean
  isFeatured: boolean
  approvalStatus?: 'PENDING' | 'APPROVED' | 'BLOCKED'
  blockedReason?: string | null
  createdAt: string
  sector: { id: string; name: string; slug: string }
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string }

export default function AdminPgsPage() {
  const [search, setSearch] = React.useState('')
  const [approvalStatus, setApprovalStatus] = React.useState('')
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.PG_WRITE) : false
  const canApprove = role ? hasPermission(role, PERMISSIONS.PG_APPROVE) : false

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pgs', search, approvalStatus],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      if (approvalStatus) qs.set('approvalStatus', approvalStatus)
      qs.set('limit', '25')

      const res = await fetch(`/api/admin/pgs?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<PgRow[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load PGs')
      return json.data
    },
  })

  const updateApproval = async (id: string, status: 'APPROVED' | 'BLOCKED') => {
    if (!canApprove) return
    const payload: Record<string, unknown> = { approvalStatus: status }
    if (status === 'BLOCKED') {
      const reason = window.prompt('Reason for blocking this PG?') || ''
      payload.blockedReason = reason
    }

    const res = await fetch(`/api/admin/pgs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await res.json()) as ApiResponse<unknown>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to update approval')
      return
    }
    await refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">PG Management</h1>
          <p className="text-sm text-muted">Create, edit, and manage pricing, availability, and SEO.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          {canWrite ? (
            <Button asChild>
              <Link href="/admin/pgs/new">Create PG</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, address, description…" />
          <select
            className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
          >
            <option value="">All Approval Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">PGs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted">No PGs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="py-2">Name</th>
                    <th className="py-2">Sector</th>
                    <th className="py-2">Rent</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Approval</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((pg) => (
                    <tr key={pg.id} className="border-b border-(--color-border)">
                      <td className="py-2">
                        <div className="font-medium">{pg.name}</div>
                        <div className="text-xs text-muted">{pg.slug}</div>
                      </td>
                      <td className="py-2">{pg.sector?.name ?? '—'}</td>
                      <td className="py-2">₹{pg.monthlyRent.toLocaleString('en-IN')}</td>
                      <td className="py-2">
                        <span className="text-xs">
                          {pg.isActive ? 'Active' : 'Inactive'}{pg.isFeatured ? ' • Featured' : ''}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className="text-xs">
                          {pg.approvalStatus || 'PENDING'}
                          {pg.blockedReason ? ` • ${pg.blockedReason}` : ''}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {canWrite ? (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/pgs/${pg.id}`}>Edit</Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted">Read only</span>
                          )}
                          {canApprove ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => updateApproval(pg.id, 'APPROVED')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateApproval(pg.id, 'BLOCKED')}>
                                Block
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

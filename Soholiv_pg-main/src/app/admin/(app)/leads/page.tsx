'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'
import type { UserRole } from '@prisma/client'

type LeadStatus = 'NEW' | 'CONTACTED' | 'VISITED' | 'INTERESTED' | 'CONVERTED' | 'CLOSED' | 'LOST'

type User = { id: string; name: string; email: string; role: string }

type Lead = {
  id: string
  name: string
  phone: string
  email: string | null
  status: LeadStatus
  priority: string
  createdAt: string
  followUpDate: string | null
  assignedToId: string | null
  assignedTo: User | null
  preferredSector: { id: string; name: string; slug: string } | null
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string }

const columns: { key: LeadStatus; title: string }[] = [
  { key: 'NEW', title: 'New' },
  { key: 'CONTACTED', title: 'Contacted' },
  { key: 'VISITED', title: 'Visited' },
  { key: 'CONVERTED', title: 'Converted' },
]

export default function AdminLeadsKanbanPage() {
  const [search, setSearch] = React.useState('')

  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canAssign = role ? hasPermission(role, PERMISSIONS.LEAD_ASSIGN) : false
  const canWrite = role ? hasPermission(role, PERMISSIONS.LEAD_WRITE) : false

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    enabled: canAssign,
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<User[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load users')
      return json.data
    },
  })

  const leadsQuery = useQuery({
    queryKey: ['admin-leads-kanban', search],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      qs.set('limit', '200')
      const res = await fetch(`/api/admin/leads?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<Lead[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load leads')
      return json.data
    },
  })

  const updateLead = async (id: string, patch: Partial<{ status: LeadStatus; assignedToId: string | null }>) => {
    if (!canWrite && patch.status) return
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })

    const json = (await res.json()) as ApiResponse<Lead>
    if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to update lead')

    await leadsQuery.refetch()
  }

  const leads = leadsQuery.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Leads Kanban</h1>
          <p className="text-sm text-muted">Move leads across stages, assign owners, and track follow-ups.</p>
        </div>
        <Button variant="outline" onClick={() => leadsQuery.refetch()}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / phone / email" />
        </CardContent>
      </Card>

      {leadsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((c) => (
            <Card key={c.key}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leadsQuery.error ? (
        <p className="text-sm text-red-600">{(leadsQuery.error as Error).message}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const items = leads.filter((l) => l.status === col.key)
            return (
              <Card key={col.key}>
                <CardHeader>
                  <CardTitle className="text-base">{col.title} <span className="text-muted">({items.length})</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((lead) => (
                    <div key={lead.id} className="rounded-lg border border-(--color-border) bg-white p-3">
                      <div className="font-medium text-sm">{lead.name}</div>
                      <div className="text-xs text-muted">{lead.phone}{lead.preferredSector ? ` • ${lead.preferredSector.name}` : ''}</div>

                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div className="text-xs">
                          <span className="text-muted">Status</span>
                          {canWrite ? (
                            <select
                              className="mt-1 h-10 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm"
                              value={lead.status}
                              onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                            >
                              {['NEW', 'CONTACTED', 'VISITED', 'INTERESTED', 'CONVERTED', 'CLOSED', 'LOST'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="mt-1 h-10 w-full rounded-lg border border-(--color-border) bg-(--color-limestone)/30 px-3 text-sm flex items-center">
                              {lead.status}
                            </div>
                          )}
                        </div>

                        <div className="text-xs">
                          <span className="text-muted">Assignee</span>
                          {canAssign ? (
                            <select
                              className="mt-1 h-10 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm"
                              value={lead.assignedToId ?? ''}
                              onChange={(e) => updateLead(lead.id, { assignedToId: e.target.value || null })}
                              disabled={usersQuery.isLoading || !!usersQuery.error}
                            >
                              <option value="">Unassigned</option>
                              {(usersQuery.data ?? []).map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.role})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="mt-1 h-10 w-full rounded-lg border border-(--color-border) bg-(--color-limestone)/30 px-3 text-sm flex items-center">
                              {lead.assignedTo ? `${lead.assignedTo.name} (${lead.assignedTo.role})` : 'Unassigned'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!items.length ? (
                    <div className="text-sm text-muted">No leads.</div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

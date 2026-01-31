'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: PaginationMeta }

type Enquiry = {
  id: string
  type: string
  status: string
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  message: string
  createdAt: string
  assignedTo: { id: string; name: string; email: string; role?: string } | null
  pg: { id: string; name: string; slug: string } | null
  sector: { id: string; name: string; slug: string } | null
}

type UserOption = { id: string; name: string; email: string; role?: string }
type PgOption = { id: string; name: string }

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const TYPE_OPTIONS = ['CONTACT_US', 'GENERAL', 'PG']

function toISOStart(dateString: string) {
  if (!dateString) return undefined
  const date = new Date(`${dateString}T00:00:00.000Z`)
  return date.toISOString()
}

function toISOEnd(dateString: string) {
  if (!dateString) return undefined
  const date = new Date(`${dateString}T23:59:59.999Z`)
  return date.toISOString()
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function AdminEnquiriesPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canClose = role ? hasPermission(role, PERMISSIONS.ENQUIRY_CLOSE) : false
  const canWrite = role ? hasPermission(role, PERMISSIONS.ENQUIRY_WRITE) : false
  const canAssign = role ? hasPermission(role, PERMISSIONS.ENQUIRY_ASSIGN) : false
  const [rows, setRows] = React.useState<Enquiry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState({
    status: '',
    type: '',
    assignedToId: '',
    pgId: '',
    search: '',
    from: '',
    to: '',
  })
  const [assignees, setAssignees] = React.useState<UserOption[]>([])
  const [pgs, setPgs] = React.useState<PgOption[]>([])

  const limit = 25

  const buildQuery = React.useCallback((nextPage: number) => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('limit', String(limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.type) params.set('type', filters.type)
    if (filters.assignedToId) params.set('assignedToId', filters.assignedToId)
    if (filters.pgId) params.set('pgId', filters.pgId)
    if (filters.search) params.set('search', filters.search)
    const from = toISOStart(filters.from)
    const to = toISOEnd(filters.to)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return params
  }, [filters, limit])

  const load = React.useCallback(async (nextPage = page) => {
    setLoading(true)
    setError(null)
    const resp = await fetch(`/api/admin/enquiries?${buildQuery(nextPage).toString()}`)
    const json = (await resp.json()) as ApiEnvelope<Enquiry[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load enquiries')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setMeta(json.meta || null)
    setLoading(false)
  }, [page, buildQuery])

  React.useEffect(() => {
    void load(1)
    setPage(1)
  }, [load])

  React.useEffect(() => {
    void load(page)
  }, [page, load])

  React.useEffect(() => {
    async function fetchAssignees() {
      if (!canAssign) return
      const resp = await fetch('/api/admin/users')
      const json = (await resp.json()) as ApiEnvelope<UserOption[]>
      if (resp.ok && json.success && json.data) setAssignees(json.data)
    }

    async function fetchPgs() {
      const resp = await fetch('/api/admin/pgs?limit=200')
      const json = (await resp.json()) as ApiEnvelope<Array<{ id: string; name: string }>>
      if (resp.ok && json.success && json.data) setPgs(json.data)
    }

    void fetchAssignees()
    void fetchPgs()
  }, [canAssign])

  async function updateEnquiry(enquiryId: string, payload: Record<string, unknown>) {
    setError(null)
    const resp = await fetch(`/api/admin/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to update enquiry')
      return
    }
    await load(page)
  }

  async function close(enquiryId: string) {
    await updateEnquiry(enquiryId, { status: 'CLOSED', closedAt: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <p className="text-sm text-muted mt-1">Inbox for website enquiries.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Recent enquiries</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ status: '', type: '', assignedToId: '', pgId: '', search: '', from: '', to: '' })
                  setPage(1)
                  void load(1)
                }}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => load(1)}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Search name, email, subject"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All Types</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.pgId}
              onChange={(e) => setFilters((prev) => ({ ...prev, pgId: e.target.value }))}
            >
              <option value="">All PGs</option>
              {pgs.map((pg) => (
                <option key={pg.id} value={pg.id}>
                  {pg.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.from}
              onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
            />

            <input
              type="date"
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.to}
              onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
            />
          </div>

          {canAssign ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <select
                className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
                value={filters.assignedToId}
                onChange={(e) => setFilters((prev) => ({ ...prev, assignedToId: e.target.value }))}
              >
                <option value="">All Assignees</option>
                {assignees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="xl:col-span-5 flex justify-end">
                <Button onClick={() => load(1)}>Apply filters</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={() => load(1)}>Apply filters</Button>
            </div>
          )}
        </div>

        {loading ? <div className="mt-4 text-sm text-muted">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {rows.map((e) => (
            <div key={e.id} className="border border-(--color-border) rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.subject || '(No subject)'}</div>
                  <div className="text-sm text-muted mt-1">
                    {e.status} • {e.name} {e.email ? `(${e.email})` : ''}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {e.pg ? `PG: ${e.pg.name}` : 'PG: —'} • {e.sector ? `Sector: ${e.sector.name}` : 'Sector: —'} •
                    {' '}
                    {formatDate(e.createdAt)}
                  </div>
                  <div className="text-sm mt-2 whitespace-pre-wrap">{e.message}</div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-45">
                  {canWrite ? (
                    <select
                      className="border border-(--color-border) rounded-md px-2 py-1 text-xs"
                      value={e.status}
                      onChange={(event) => {
                        const next = event.target.value
                        if (next === 'CLOSED' && !canClose) return
                        void updateEnquiry(e.id, { status: next })
                      }}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} disabled={status === 'CLOSED' && !canClose}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-muted">Read only</span>
                  )}

                  {canAssign ? (
                    <select
                      className="border border-(--color-border) rounded-md px-2 py-1 text-xs"
                      value={e.assignedTo?.id || ''}
                      onChange={(event) => {
                        const next = event.target.value || null
                        void updateEnquiry(e.id, { assignedToId: next })
                      }}
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {canClose ? (
                    <Button variant="outline" size="sm" onClick={() => close(e.id)}>
                      Close
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="text-sm text-muted">No enquiries yet.</div>
          ) : null}
        </div>

        {meta ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted">
              Page {meta.page} of {meta.totalPages} • {meta.total} total
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={meta.page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

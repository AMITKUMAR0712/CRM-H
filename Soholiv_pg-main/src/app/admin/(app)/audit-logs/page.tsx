'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'


type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: PaginationMeta }

type AuditLog = {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  summary: string | null
  createdAt: string
  actor: { id: string; name: string; email: string; role?: string } | null
}

type UserOption = { id: string; name: string; email: string; role?: string }

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

export default function AuditLogsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canView = role ? hasPermission(role, PERMISSIONS.LOGS_READ) : false
  const canFetchActors = role
    ? hasPermission(role, PERMISSIONS.USER_READ) || hasPermission(role, PERMISSIONS.USERS_BLOCK)
    : false
  const [rows, setRows] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState({
    action: '',
    entityType: '',
    actorId: '',
    search: '',
    from: '',
    to: '',
  })
  const [actors, setActors] = React.useState<UserOption[]>([])

  const limit = 25

  function exportCsv() {
    if (!rows.length) return
    const header = ['Timestamp', 'Actor', 'Actor Email', 'Action', 'Entity Type', 'Entity ID', 'Summary']
    const lines = rows.map((row) => [
      formatDate(row.createdAt),
      row.actor?.name || 'System',
      row.actor?.email || '',
      row.action,
      row.entityType || '',
      row.entityId || '',
      (row.summary || '').replace(/\r?\n/g, ' '),
    ])

    const csv = [header, ...lines]
      .map((cols) => cols.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const buildQuery = React.useCallback((nextPage: number) => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('limit', String(limit))
    if (filters.action) params.set('action', filters.action)
    if (filters.entityType) params.set('entityType', filters.entityType)
    if (filters.actorId) params.set('actorId', filters.actorId)
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
    const resp = await fetch(`/api/admin/audit-logs?${buildQuery(nextPage).toString()}`)
    const json = (await resp.json()) as ApiEnvelope<AuditLog[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load audit logs')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setMeta(json.meta || null)
    setLoading(false)
  }, [page, buildQuery])

  React.useEffect(() => {
    if (!canView) return
    void load(1)
    setPage(1)
  }, [canView, load])

  React.useEffect(() => {
    if (!canView) return
    void load(page)
  }, [page, canView, load])

  React.useEffect(() => {
    async function fetchActors() {
      if (!canView || !canFetchActors) return
      const resp = await fetch('/api/admin/users?limit=200')
      const json = (await resp.json()) as ApiEnvelope<UserOption[]>
      if (resp.ok && json.success && json.data) setActors(json.data)
    }

    void fetchActors()
  }, [canView, canFetchActors])

  if (!canView) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to view audit logs.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted">Track sensitive actions across the platform.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Recent activity</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ action: '', entityType: '', actorId: '', search: '', from: '', to: '' })
                  setPage(1)
                  void load(1)
                }}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => load(1)}>
                Refresh
              </Button>
              <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Search summary or entity ID"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Action"
              value={filters.action}
              onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Entity type"
              value={filters.entityType}
              onChange={(e) => setFilters((prev) => ({ ...prev, entityType: e.target.value }))}
            />

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.actorId}
              onChange={(e) => setFilters((prev) => ({ ...prev, actorId: e.target.value }))}
              disabled={!canFetchActors}
            >
              <option value="">{canFetchActors ? 'All actors' : 'Actor filter unavailable'}</option>
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name} ({actor.role || 'user'})
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

          <div className="flex items-center gap-2">
            <Button onClick={() => load(1)}>Apply filters</Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted">Loading...</div>
          ) : (
            <div className="overflow-auto border border-(--color-border) rounded-md">
              <table className="min-w-225 w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="border-b border-(--color-border)">
                        <td className="p-3 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                        <td className="p-3">
                          <div className="font-medium">{row.actor?.name || 'System'}</div>
                          <div className="text-xs text-muted">{row.actor?.email || '—'}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{row.action}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{row.entityType || '—'}</div>
                          <div className="text-xs text-muted">{row.entityId || '—'}</div>
                        </td>
                        <td className="p-3 max-w-[320px] truncate">{row.summary || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {meta ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
              <div className="text-muted">
                Page {meta.page} of {meta.totalPages} • {meta.total} total
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

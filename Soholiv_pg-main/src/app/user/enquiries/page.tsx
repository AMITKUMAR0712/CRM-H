'use client'

import * as React from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: PaginationMeta }

type Enquiry = {
  id: string
  type: string
  status: string
  subject: string | null
  message: string
  createdAt: string
  pg: { id: string; name: string; slug: string } | null
  sector: { id: string; name: string; slug: string } | null
}

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

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

export default function UserEnquiriesPage() {
  const [rows, setRows] = React.useState<Enquiry[]>([])
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState({ status: '', search: '', from: '', to: '' })
  const limit = 10

  const buildQuery = React.useCallback((nextPage: number) => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('limit', String(limit))
    if (filters.status) params.set('status', filters.status)
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
    const resp = await fetch(`/api/user/enquiries?${buildQuery(nextPage).toString()}`)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Enquiries</h1>
        <p className="text-sm text-muted mt-1">Track the status of your requests.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
            placeholder="Search subject or message"
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

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFilters({ status: '', search: '', from: '', to: '' })
              setPage(1)
              void load(1)
            }}
          >
            Reset
          </Button>
          <Button onClick={() => load(1)}>Apply filters</Button>
        </div>
      </Card>

      <Card className="p-5">
        {loading ? <div className="text-sm text-muted">Loading…</div> : null}

        <div className="grid gap-3">
          {rows.map((e) => (
            <div key={e.id} className="border border-(--color-border) rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.subject || '(No subject)'}</div>
                  <div className="text-xs text-muted mt-1">
                    Status: {e.status} • {formatDate(e.createdAt)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {e.pg ? `PG: ${e.pg.name}` : 'PG: —'} • {e.sector ? `Sector: ${e.sector.name}` : 'Sector: —'}
                  </div>
                  <div className="text-sm mt-2 whitespace-pre-wrap">{e.message}</div>
                </div>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? <div className="text-sm text-muted">No enquiries yet.</div> : null}
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

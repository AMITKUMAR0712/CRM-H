'use client'

import * as React from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: unknown }

type Ticket = {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  user?: { id: string; name: string; email: string } | null
}

export default function AdminTicketsPage() {
  const [rows, setRows] = React.useState<Ticket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch('/api/admin/tickets?limit=50')
    const json = (await resp.json()) as ApiEnvelope<Ticket[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load tickets')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Support desk tickets.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Recent tickets</div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? <div className="mt-4 text-sm text-[var(--color-muted)]">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {rows.map((t) => (
            <div key={t.id} className="border border-[var(--color-border)] rounded-lg p-4">
              <div className="font-medium">{t.subject}</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">
                {t.status} • {t.priority} • {t.category}
                {t.user ? ` • ${t.user.name} (${t.user.email})` : ''}
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="text-sm text-[var(--color-muted)]">No tickets yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

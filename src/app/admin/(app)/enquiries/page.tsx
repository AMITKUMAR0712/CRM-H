'use client'

import * as React from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: unknown }

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
}

export default function AdminEnquiriesPage() {
  const [rows, setRows] = React.useState<Enquiry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch('/api/admin/enquiries?limit=50')
    const json = (await resp.json()) as ApiEnvelope<Enquiry[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load enquiries')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    void load()
  }, [])

  async function close(enquiryId: string) {
    setError(null)
    const resp = await fetch(`/api/admin/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED', closedAt: new Date().toISOString() }),
    })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to update enquiry')
      return
    }
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Inbox for website enquiries.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Recent enquiries</div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? <div className="mt-4 text-sm text-[var(--color-muted)]">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {rows.map((e) => (
            <div key={e.id} className="border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.subject || '(No subject)'}</div>
                  <div className="text-sm text-[var(--color-muted)] mt-1">
                    {e.status} • {e.name} {e.email ? `(${e.email})` : ''}
                  </div>
                  <div className="text-sm mt-2 whitespace-pre-wrap">{e.message}</div>
                </div>
                <Button variant="outline" onClick={() => close(e.id)}>
                  Close
                </Button>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="text-sm text-[var(--color-muted)]">No enquiries yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

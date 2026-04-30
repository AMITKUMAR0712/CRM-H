'use client'

import * as React from 'react'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

type TicketListItem = {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
}

export default function UserTicketsPage() {
  const [tickets, setTickets] = React.useState<TicketListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      const resp = await fetch('/api/user/tickets')
      const json = (await resp.json()) as ApiEnvelope<TicketListItem[]>
      if (!mounted) return
      if (!resp.ok || !json.success) {
        setError(json.error || json.message || 'Failed to load tickets')
        setLoading(false)
        return
      }
      setTickets(json.data || [])
      setLoading(false)
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Support Tickets</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Create and track your support requests.</p>
        </div>
        <Button asChild>
          <Link href="/user/tickets/new">New ticket</Link>
        </Button>
      </div>

      {loading ? <div className="text-sm text-[var(--color-muted)]">Loading…</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-3">
        {tickets.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{t.subject}</div>
                <div className="text-sm text-[var(--color-muted)] mt-1">
                  {t.status} • {t.priority} • {t.category}
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/user/tickets/${t.id}`}>View</Link>
              </Button>
            </div>
          </Card>
        ))}
        {!loading && tickets.length === 0 ? (
          <Card className="p-4">
            <div className="text-sm text-[var(--color-muted)]">No tickets yet.</div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

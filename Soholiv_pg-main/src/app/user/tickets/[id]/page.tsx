'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

type TicketMessage = {
  id: string
  isInternal: boolean
  message: string
  createdAt: string
  sender: { id: string; name: string; email: string } | null
}

type TicketDetail = {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  messages: TicketMessage[]
}

export default function TicketDetailPage() {
  const params = useParams<{ id?: string }>()
  const ticketId = params?.id ?? ''

  const [ticket, setTicket] = React.useState<TicketDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [reply, setReply] = React.useState('')
  const [pending, setPending] = React.useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch(`/api/user/tickets/${ticketId}`)
    const json = (await resp.json()) as ApiEnvelope<TicketDetail>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load ticket')
      setLoading(false)
      return
    }
    setTicket(json.data || null)
    setLoading(false)
  }

  React.useEffect(() => {
    if (!ticketId) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return

    setPending(true)
    const resp = await fetch(`/api/user/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>
    setPending(false)

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to send message')
      return
    }

    setReply('')
    await load()
  }

  if (!ticketId) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">Ticket not found.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {loading ? <div className="text-sm text-[var(--color-muted)]">Loading…</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {ticket ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              {ticket.status} • {ticket.priority} • {ticket.category}
            </p>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              {ticket.messages
                .filter((m) => !m.isInternal)
                .map((m) => (
                  <div key={m.id} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                    <div className="text-sm font-medium">
                      {m.sender?.name || 'Support'}
                      <span className="text-xs text-[var(--color-muted)]"> • {new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-wrap">{m.message}</div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-4">
            <form className="flex gap-2" onSubmit={sendReply}>
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" />
              <Button disabled={pending} type="submit">
                {pending ? 'Sending…' : 'Send'}
              </Button>
            </form>
          </Card>
        </>
      ) : null}
    </div>
  )
}

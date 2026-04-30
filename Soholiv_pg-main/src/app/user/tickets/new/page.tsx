'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; details?: unknown }

export default function NewTicketPage() {
  const router = useRouter()

  const [subject, setSubject] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('OTHER')
  const [priority, setPriority] = React.useState('MEDIUM')

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const resp = await fetch('/api/user/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, category, priority }),
    })

    const json = (await resp.json()) as ApiEnvelope<{ id: string }>

    setPending(false)

    if (!resp.ok || !json.success || !json.data?.id) {
      const msg = json.error || json.message || 'Failed to create ticket'
      const details = json.details ? `: ${JSON.stringify(json.details)}` : ''
      setError(`${msg}${details}`)
      return
    }

    router.push(`/user/tickets/${json.data.id}`)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New ticket</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Describe your issue and submit.</p>
      </div>

      <Card className="p-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. WiFi not working" />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-lg border border-[var(--color-border)] bg-(--color-surface) text-(--color-graphite) px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Provide more details about the issue..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-(--color-surface) text-(--color-graphite) px-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="ELECTRICITY">Electricity</option>
                <option value="FOOD">Food</option>
                <option value="ROOM">Room</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-(--color-surface) text-(--color-graphite) px-3"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex gap-2">
            <Button disabled={pending} type="submit">
              {pending ? 'Creating…' : 'Create ticket'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/user/tickets')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

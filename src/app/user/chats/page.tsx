'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

type ChatThread = {
  id: string
  status: string
  createdAt: string
  lastMessageAt: string | null
}

export default function UserChatsPage() {
  const router = useRouter()

  const [threads, setThreads] = React.useState<ChatThread[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch('/api/user/chats')
    const json = (await resp.json()) as ApiEnvelope<ChatThread[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load chats')
      setLoading(false)
      return
    }
    setThreads(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    void load()
  }, [])

  async function startChat() {
    setPending(true)
    setError(null)

    const resp = await fetch('/api/user/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const json = (await resp.json()) as ApiEnvelope<{ id: string }>

    setPending(false)

    if (!resp.ok || !json.success || !json.data?.id) {
      setError(json.error || json.message || 'Failed to start chat')
      return
    }

    router.push(`/user/chats/${json.data.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Chat</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Message support directly.</p>
        </div>
        <Button disabled={pending} onClick={startChat}>
          {pending ? 'Starting…' : 'Start chat'}
        </Button>
      </div>

      {loading ? <div className="text-sm text-[var(--color-muted)]">Loading…</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-3">
        {threads.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">Thread {t.id.slice(0, 8)}</div>
                <div className="text-sm text-[var(--color-muted)] mt-1">{t.status}</div>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/user/chats/${t.id}`}>Open</Link>
              </Button>
            </div>
          </Card>
        ))}
        {!loading && threads.length === 0 ? (
          <Card className="p-4">
            <div className="text-sm text-[var(--color-muted)]">No chats yet.</div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

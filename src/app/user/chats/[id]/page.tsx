'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

type ChatMessage = {
  id: string
  message: string
  createdAt: string
  senderRole: string
}

type ChatThreadDetail = {
  id: string
  status: string
}

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>()
  const threadId = params.id

  const [thread, setThread] = React.useState<ChatThreadDetail | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [text, setText] = React.useState('')
  const [pending, setPending] = React.useState(false)

  async function load() {
    setLoading(true)
    setError(null)

    const listResp = await fetch(`/api/user/chats/${threadId}/messages`)
    const listJson = (await listResp.json()) as ApiEnvelope<{ thread: ChatThreadDetail; messages: ChatMessage[] }>

    if (!listResp.ok || !listJson.success) {
      setError(listJson.error || listJson.message || 'Failed to load messages')
      setLoading(false)
      return
    }

    setThread(listJson.data?.thread || null)
    setMessages(listJson.data?.messages || [])
    setLoading(false)
  }

  React.useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setPending(true)

    const resp = await fetch(`/api/user/chats/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    setPending(false)

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to send message')
      return
    }

    setText('')
    await load()
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {loading ? <div className="text-sm text-[var(--color-muted)]">Loading…</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {thread ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Chat</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">Status: {thread.status}</p>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                  <div className="text-xs text-[var(--color-muted)]">
                    {m.senderRole} • {new Date(m.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{m.message}</div>
                </div>
              ))}
              {messages.length === 0 ? <div className="text-sm text-[var(--color-muted)]">No messages yet.</div> : null}
            </div>
          </Card>

          <Card className="p-4">
            <form className="flex gap-2" onSubmit={send}>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" />
              <Button disabled={pending || thread.status === 'CLOSED'} type="submit">
                {pending ? 'Sending…' : 'Send'}
              </Button>
            </form>
            {thread.status === 'CLOSED' ? (
              <div className="text-xs text-[var(--color-muted)] mt-2">This chat is closed.</div>
            ) : null}
          </Card>
        </>
      ) : null}
    </div>
  )
}

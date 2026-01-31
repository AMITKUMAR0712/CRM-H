'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: unknown }

type ChatThread = {
  id: string
  status: string
  createdAt: string
  lastMessageAt: string | null
  user?: { id: string; name: string; email: string } | null
}

export default function AdminChatsPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canRead = role ? hasPermission(role, PERMISSIONS.CHAT_READ) : false
  const [rows, setRows] = React.useState<ChatThread[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch('/api/admin/chats?limit=50')
    const json = (await resp.json()) as ApiEnvelope<ChatThread[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load chats')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    if (!canRead) return
    void load()
  }, [canRead])

  if (!canRead) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to view chats.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chats</h1>
        <p className="text-sm text-muted mt-1">User chat threads.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Recent chats</div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? <div className="mt-4 text-sm text-muted">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {rows.map((t) => (
            <div key={t.id} className="border border-(--color-border) rounded-lg p-4">
              <div className="font-medium">Thread {t.id.slice(0, 8)}</div>
              <div className="text-sm text-muted mt-1">
                {t.status}
                {t.user ? ` • ${t.user.name} (${t.user.email})` : ''}
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="text-sm text-muted">No chats yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

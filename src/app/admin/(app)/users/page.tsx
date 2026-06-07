'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'



type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string }

type User = {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canManage = role ? hasPermission(role, PERMISSIONS.USERS_BLOCK) : false
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)

    const resp = await fetch('/api/admin/users')
    const json = (await resp.json()) as ApiEnvelope<User[]>

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load users')
      setLoading(false)
      return
    }

    setUsers(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    if (!canManage) return
    void load()
  }, [canManage])

  async function blockUser(userId: string) {
    setError(null)

    const resp = await fetch(`/api/admin/users/${userId}/restrictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'HARD_BLOCK', reason: 'Blocked by admin' }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to block user')
      return
    }

    await load()
  }

  async function unblockUser(userId: string) {
    setError(null)

    const resp = await fetch(`/api/admin/users/${userId}/restrictions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revokedReason: 'Unblocked by admin' }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to unblock user')
      return
    }

    await load()
  }

  if (!canManage) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to manage users.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted mt-1">Manage users and apply restrictions.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Active users</div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? <div className="mt-4 text-sm text-muted">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="border border-(--color-border) rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-sm text-muted mt-1 truncate">{u.email} • {u.role}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => blockUser(u.id)}>
                    Block
                  </Button>
                  <Button variant="outline" onClick={() => unblockUser(u.id)}>
                    Unblock
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!loading && users.length === 0 ? (
            <div className="text-sm text-muted">No users found.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

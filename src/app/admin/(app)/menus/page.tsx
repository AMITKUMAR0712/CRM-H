'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown }

type MenuItemRow = {
  id: string
  title: string
  type: 'PAGE' | 'URL'
  href: string | null
  pageId: string | null
  parentId: string | null
  order: number
  visibility: 'HEADER' | 'FOOTER' | 'BOTH'
  isActive: boolean
  openInNewTab: boolean
  page?: { id: string; title: string; slug: string; status: string; isActive: boolean } | null
}

export default function AdminMenusPage() {
  const [title, setTitle] = React.useState('')
  const [href, setHref] = React.useState('')
  const [visibility, setVisibility] = React.useState<'HEADER' | 'FOOTER' | 'BOTH'>('HEADER')
  const [isActive, setIsActive] = React.useState(true)

  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.MENU_WRITE) : false
  const canDelete = role ? hasPermission(role, PERMISSIONS.MENU_DELETE) : false

  const menuQuery = useQuery({
    queryKey: ['admin-menus'],
    queryFn: async () => {
      const res = await fetch('/api/admin/menus?includeInactive=true', { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<MenuItemRow[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load menu')
      return json.data
    },
  })

  async function createItem() {
    if (!canWrite) return
    const res = await fetch('/api/admin/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type: 'URL',
        href,
        visibility,
        isActive,
      }),
    })

    const json = (await res.json()) as ApiResponse<MenuItemRow>
    if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to create')

    setTitle('')
    setHref('')
    await menuQuery.refetch()
  }

  async function toggleActive(item: MenuItemRow) {
    if (!canWrite) return
    const res = await fetch(`/api/admin/menus/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    })

    const json = (await res.json()) as ApiResponse<MenuItemRow>
    if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to update')

    await menuQuery.refetch()
  }

  async function deleteItem(item: MenuItemRow) {
    if (!canDelete) return
    const ok = confirm(`Delete menu item "${item.title}"?`)
    if (!ok) return

    const res = await fetch(`/api/admin/menus/${item.id}`, { method: 'DELETE' })
    const json = (await res.json()) as ApiResponse<unknown>
    if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to delete')

    await menuQuery.refetch()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Menu Manager</h1>
        <p className="text-sm text-muted">Create, enable/disable, and reorder navigation links.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Menu Item (URL)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Locations" />
            </div>
            <div>
              <label className="text-sm font-medium">Href</label>
              <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/pg-locations" />
            </div>
            <div>
              <label className="text-sm font-medium">Visibility</label>
              <select
                className="h-10 w-full rounded-md border border-(--color-border) bg-white px-3 text-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'HEADER' | 'FOOTER' | 'BOTH')}
              >
                <option value="HEADER">Header</option>
                <option value="FOOTER">Footer</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
            {canWrite ? (
              <Button onClick={() => createItem()} disabled={!title || !href || menuQuery.isFetching}>
                Create
              </Button>
            ) : (
              <span className="text-xs text-muted">Read only</span>
            )}
            <Button variant="outline" onClick={() => menuQuery.refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {menuQuery.isLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : menuQuery.error ? (
            <p className="text-sm text-red-600">{(menuQuery.error as Error).message}</p>
          ) : !menuQuery.data?.length ? (
            <p className="text-sm text-muted">No menu items yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="py-2">Title</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Href</th>
                    <th className="py-2">Visibility</th>
                    <th className="py-2">Order</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuQuery.data.map((item) => (
                    <tr key={item.id} className="border-b border-(--color-border)">
                      <td className="py-2 font-medium">{item.title}</td>
                      <td className="py-2">{item.type}</td>
                      <td className="py-2">{item.type === 'URL' ? item.href : item.page?.slug ? `/${item.page.slug}` : '—'}</td>
                      <td className="py-2">{item.visibility}</td>
                      <td className="py-2">{item.order}</td>
                      <td className="py-2">{item.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="py-2 flex gap-2">
                        {canWrite ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => toggleActive(item)}>
                              {item.isActive ? 'Disable' : 'Enable'}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted">Read only</span>
                        )}
                        {canDelete ? (
                          <Button size="sm" variant="outline" onClick={() => deleteItem(item)}>
                            Delete
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

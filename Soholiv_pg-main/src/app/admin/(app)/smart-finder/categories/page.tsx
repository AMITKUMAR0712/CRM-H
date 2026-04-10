'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: PaginationMeta }

type SmartCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  createdAt: string
}

export default function SmartCategoryPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.SMART_CATEGORY_WRITE) : false
  const canDelete = role ? hasPermission(role, PERMISSIONS.SMART_CATEGORY_DELETE) : false

  const [rows, setRows] = React.useState<SmartCategory[]>([])
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [includeInactive, setIncludeInactive] = React.useState(false)

  const [form, setForm] = React.useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  })

  const limit = 25

  const buildQuery = React.useCallback(
    (nextPage = page) => {
      const params = new URLSearchParams()
      params.set('page', String(nextPage))
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (includeInactive) params.set('includeInactive', 'true')
      return params
    },
    [page, search, includeInactive]
  )

  const load = React.useCallback(
    async (nextPage = page) => {
      setLoading(true)
      setError(null)
      const resp = await fetch(`/api/admin/smart-categories?${buildQuery(nextPage).toString()}`)
      const json = (await resp.json()) as ApiEnvelope<SmartCategory[]>
      if (!resp.ok || !json.success) {
        setError(json.error || json.message || 'Failed to load categories')
        setLoading(false)
        return
      }
      setRows(json.data || [])
      setMeta(json.meta || null)
      setLoading(false)
    },
    [page, buildQuery]
  )

  React.useEffect(() => {
    void load(page)
  }, [load, page])

  async function createCategory() {
    if (!canWrite) return
    setError(null)
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      isActive: form.isActive,
    }

    const resp = await fetch('/api/admin/smart-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await resp.json()) as ApiEnvelope<SmartCategory>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to create category')
      return
    }

    setForm({ name: '', slug: '', description: '', isActive: true })
    await load(1)
    setPage(1)
  }

  async function updateCategory(id: string, payload: Record<string, unknown>) {
    if (!canWrite) return
    setError(null)
    const resp = await fetch(`/api/admin/smart-categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await resp.json()) as ApiEnvelope<SmartCategory>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to update category')
      return
    }
    await load(page)
  }

  async function deleteCategory(id: string) {
    if (!canDelete) return
    const ok = window.confirm('Delete this category?')
    if (!ok) return
    setError(null)
    const resp = await fetch(`/api/admin/smart-categories/${id}`, { method: 'DELETE' })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to delete category')
      return
    }
    await load(page)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Smart Finder Categories</h1>
        <p className="text-sm text-muted mt-1">Manage categories used to filter PGs.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {canWrite ? (
        <Card className="p-5 space-y-4">
          <div className="font-medium">Create category</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Slug (boys-pg)"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex justify-end">
            <Button onClick={createCategory}>Create</Button>
          </div>
        </Card>
      ) : null}

      <Card className="p-5 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Categories</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setIncludeInactive(false)
                  setPage(1)
                  void load(1)
                }}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => load(1)}>Refresh</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search name or slug"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              Include inactive
            </label>
            <div className="flex justify-end">
              <Button onClick={() => load(1)}>Apply filters</Button>
            </div>
          </div>
        </div>

        {loading ? <div className="text-sm text-muted">Loading…</div> : null}

        <div className="grid gap-3">
          {rows.map((category) => (
            <div key={category.id} className="border border-(--color-border) rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted">{category.slug}</div>
                  {category.description ? <div className="text-sm mt-1 text-muted">{category.description}</div> : null}
                </div>
                <div className="flex items-center gap-2">
                  {canWrite ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCategory(category.id, { isActive: !category.isActive })}
                    >
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button size="sm" variant="outline" onClick={() => deleteCategory(category.id)}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && rows.length === 0 ? <div className="text-sm text-muted">No categories found.</div> : null}

        {meta ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted">
              Page {meta.page} of {meta.totalPages} • {meta.total} total
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={meta.page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

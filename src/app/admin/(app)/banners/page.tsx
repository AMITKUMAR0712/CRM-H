'use client'

import * as React from 'react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: unknown }

type BannerTarget = {
  id: string
  scope: string
  sectorId: string | null
  pgId: string | null
}

type Banner = {
  id: string
  type: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaHref: string | null
  isActive: boolean
  priority: number
  displayOrder: number
  targets: BannerTarget[]
}

export default function AdminBannersPage() {
  const [rows, setRows] = React.useState<Banner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [pending, setPending] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [subtitle, setSubtitle] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState('')
  const [ctaLabel, setCtaLabel] = React.useState('')
  const [ctaHref, setCtaHref] = React.useState('')
  const [type, setType] = React.useState('HERO')
  const [scope, setScope] = React.useState('HOME')

  async function load() {
    setLoading(true)
    setError(null)
    const resp = await fetch('/api/admin/banners?limit=50')
    const json = (await resp.json()) as ApiEnvelope<Banner[]>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to load banners')
      setLoading(false)
      return
    }
    setRows(json.data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    void load()
  }, [])

  async function createBanner(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const resp = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl || null,
        ctaLabel: ctaLabel || null,
        ctaHref: ctaHref || null,
        isActive: true,
        targets: [{ scope }],
      }),
    })

    const json = (await resp.json()) as ApiEnvelope<unknown>
    setPending(false)

    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to create banner')
      return
    }

    setTitle('')
    setSubtitle('')
    setImageUrl('')
    setCtaLabel('')
    setCtaHref('')
    await load()
  }

  async function toggleActive(banner: Banner) {
    setError(null)
    const resp = await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !banner.isActive }),
    })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to update banner')
      return
    }
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Banners</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Create and manage homepage/sector/PG banners.</p>
      </div>

      <Card className="p-5">
        <div className="font-medium">Create banner</div>
        <form className="mt-4 grid gap-3" onSubmit={createBanner}>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-white px-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="HERO">Hero</option>
                <option value="CARD">Card</option>
                <option value="DISCOUNT">Discount</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Scope</label>
              <select
                className="h-12 w-full rounded-lg border border-[var(--color-border)] bg-white px-3"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="HOME">Home</option>
                <option value="SECTOR">Sector</option>
                <option value="PG">PG</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <label className="text-sm font-medium">CTA Href</label>
              <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/pg-locations" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">CTA Label</label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Explore" />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button disabled={pending} type="submit">
            {pending ? 'Creating…' : 'Create banner'}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="font-medium">All banners</div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {loading ? <div className="mt-4 text-sm text-[var(--color-muted)]">Loading…</div> : null}

        <div className="mt-4 grid gap-3">
          {rows.map((b) => (
            <div key={b.id} className="border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{b.title}</div>
                  <div className="text-sm text-[var(--color-muted)] mt-1">
                    {b.type} • {b.isActive ? 'Active' : 'Inactive'} • {b.targets?.[0]?.scope || '—'}
                  </div>
                </div>
                <Button variant="outline" onClick={() => toggleActive(b)}>
                  {b.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="text-sm text-[var(--color-muted)]">No banners yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

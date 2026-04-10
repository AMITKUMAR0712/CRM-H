'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string; message?: string; meta?: PaginationMeta }

type GalleryImage = {
  id: string
  url: string
  altText?: string | null
  caption?: string | null
  album: string
  sectorSlug?: string | null
  pgId?: string | null
  roomType?: string | null
  floor?: number | null
  availability?: string | null
  displayOrder: number
  isFeatured: boolean
  isActive: boolean
  createdAt: string
}

type PgOption = { id: string; name: string }

type SectorOption = { id: string; name: string; slug: string }

const ALBUMS = ['rooms', 'common', 'food', 'neighborhood', 'safety', 'exterior']
const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING']

export default function AdminGalleryPage() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.MEDIA_WRITE) : false
  const canDelete = role ? hasPermission(role, PERMISSIONS.MEDIA_DELETE) : false

  const [rows, setRows] = React.useState<GalleryImage[]>([])
  const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)

  const [pgs, setPgs] = React.useState<PgOption[]>([])
  const [sectors, setSectors] = React.useState<SectorOption[]>([])

  const [filters, setFilters] = React.useState({
    album: '',
    pgId: '',
    sectorSlug: '',
    roomType: '',
    includeInactive: false,
  })

  const [form, setForm] = React.useState({
    urls: '',
    album: 'rooms',
    pgId: '',
    sectorSlug: '',
    roomType: '',
    floor: '',
    availability: '',
    caption: '',
    altText: '',
    displayOrder: '0',
    isFeatured: false,
    isActive: true,
  })
  const [files, setFiles] = React.useState<File[]>([])

  const limit = 24

  const buildQuery = React.useCallback(
    (nextPage = page) => {
      const params = new URLSearchParams()
      params.set('page', String(nextPage))
      params.set('limit', String(limit))
      if (filters.album) params.set('album', filters.album)
      if (filters.pgId) params.set('pgId', filters.pgId)
      if (filters.sectorSlug) params.set('sectorSlug', filters.sectorSlug)
      if (filters.roomType) params.set('roomType', filters.roomType)
      if (filters.includeInactive) params.set('includeInactive', 'true')
      return params
    },
    [page, filters]
  )

  const load = React.useCallback(
    async (nextPage = page) => {
      setLoading(true)
      setError(null)
      const resp = await fetch(`/api/gallery?${buildQuery(nextPage).toString()}`)
      const json = (await resp.json()) as ApiEnvelope<GalleryImage[]>
      if (!resp.ok || !json.success) {
        setError(json.error || json.message || 'Failed to load gallery')
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

  React.useEffect(() => {
    async function fetchPgs() {
      const resp = await fetch('/api/admin/pgs?limit=200')
      const json = (await resp.json()) as ApiEnvelope<PgOption[]>
      if (resp.ok && json.success && json.data) setPgs(json.data)
    }

    async function fetchSectors() {
      const resp = await fetch('/api/admin/sectors?limit=200&isActive=true')
      const json = (await resp.json()) as ApiEnvelope<SectorOption[]>
      if (resp.ok && json.success && json.data) setSectors(json.data)
    }

    void fetchPgs()
    void fetchSectors()
  }, [])

  async function updateImage(id: string, payload: Record<string, unknown>) {
    setError(null)
    const resp = await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to update image')
      return
    }
    await load(page)
  }

  async function deleteImage(id: string) {
    setError(null)
    const resp = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to delete image')
      return
    }
    await load(page)
  }

  async function createImages() {
    if (!canWrite) return
    setError(null)
    const urls = form.urls
      .split(/\r?\n|,/)
      .map((u) => u.trim())
      .filter(Boolean)

    if (!urls.length) {
      setError('Please provide at least one image URL')
      return
    }

    for (const url of urls) {
      const payload = {
        url,
        album: form.album,
        sectorSlug: form.sectorSlug || undefined,
        pgId: form.pgId || undefined,
        roomType: form.roomType || undefined,
        floor: form.floor ? Number(form.floor) : undefined,
        availability: form.availability || undefined,
        caption: form.caption || undefined,
        altText: form.altText || undefined,
        displayOrder: Number(form.displayOrder || 0),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      }

      const resp = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await resp.json()) as ApiEnvelope<unknown>
      if (!resp.ok || !json.success) {
        setError(json.error || json.message || 'Failed to create gallery image')
        return
      }
    }

    setForm((prev) => ({ ...prev, urls: '' }))
    await load(1)
    setPage(1)
  }

  async function uploadFiles() {
    if (!canWrite) return
    if (!files.length) {
      setError('Please select files to upload')
      return
    }

    setError(null)
    const formData = new FormData()
    formData.set('album', form.album)
    if (form.pgId) formData.set('pgId', form.pgId)
    if (form.sectorSlug) formData.set('sectorSlug', form.sectorSlug)
    if (form.roomType) formData.set('roomType', form.roomType)
    if (form.floor) formData.set('floor', form.floor)
    if (form.availability) formData.set('availability', form.availability)
    if (form.caption) formData.set('caption', form.caption)
    if (form.altText) formData.set('altText', form.altText)
    formData.set('displayOrder', form.displayOrder || '0')
    formData.set('isFeatured', String(form.isFeatured))
    formData.set('isActive', String(form.isActive))
    files.forEach((file) => formData.append('files', file))

    const resp = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData,
    })
    const json = (await resp.json()) as ApiEnvelope<unknown>
    if (!resp.ok || !json.success) {
      setError(json.error || json.message || 'Failed to upload images')
      return
    }

    setFiles([])
    await load(1)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gallery Management</h1>
        <p className="text-sm text-muted mt-1">Manage gallery images, metadata, and visibility.</p>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {canWrite ? (
        <Card className="p-5 space-y-4">
          <div className="font-medium">Add gallery images</div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload files</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {files.length ? <div className="text-xs text-muted">{files.length} file(s) selected</div> : null}
          </div>
          <textarea
            className="border border-(--color-border) rounded-md px-3 py-2 text-sm min-h-30"
            placeholder="Paste one or more image URLs (one per line)"
            value={form.urls}
            onChange={(e) => setForm((prev) => ({ ...prev, urls: e.target.value }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={form.album}
              onChange={(e) => setForm((prev) => ({ ...prev, album: e.target.value }))}
            >
              {ALBUMS.map((album) => (
                <option key={album} value={album}>
                  {album}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={form.pgId}
              onChange={(e) => setForm((prev) => ({ ...prev, pgId: e.target.value }))}
            >
              <option value="">No PG</option>
              {pgs.map((pg) => (
                <option key={pg.id} value={pg.id}>
                  {pg.name}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={form.sectorSlug}
              onChange={(e) => setForm((prev) => ({ ...prev, sectorSlug: e.target.value }))}
            >
              <option value="">No Sector</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.slug}>
                  {sector.name}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={form.roomType}
              onChange={(e) => setForm((prev) => ({ ...prev, roomType: e.target.value }))}
            >
              <option value="">Room Type (optional)</option>
              {ROOM_TYPES.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              type="number"
              min={0}
              placeholder="Floor (optional)"
              value={form.floor}
              onChange={(e) => setForm((prev) => ({ ...prev, floor: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Availability (optional)"
              value={form.availability}
              onChange={(e) => setForm((prev) => ({ ...prev, availability: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Caption"
              value={form.caption}
              onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              placeholder="Alt text"
              value={form.altText}
              onChange={(e) => setForm((prev) => ({ ...prev, altText: e.target.value }))}
            />

            <input
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              type="number"
              min={0}
              placeholder="Display order"
              value={form.displayOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button variant="outline" onClick={createImages}>Create from URLs</Button>
              <Button onClick={uploadFiles}>Upload files</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-5 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Gallery images</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ album: '', pgId: '', sectorSlug: '', roomType: '', includeInactive: false })
                  setPage(1)
                  void load(1)
                }}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => load(1)}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.album}
              onChange={(e) => setFilters((prev) => ({ ...prev, album: e.target.value }))}
            >
              <option value="">All Albums</option>
              {ALBUMS.map((album) => (
                <option key={album} value={album}>
                  {album}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.pgId}
              onChange={(e) => setFilters((prev) => ({ ...prev, pgId: e.target.value }))}
            >
              <option value="">All PGs</option>
              {pgs.map((pg) => (
                <option key={pg.id} value={pg.id}>
                  {pg.name}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.sectorSlug}
              onChange={(e) => setFilters((prev) => ({ ...prev, sectorSlug: e.target.value }))}
            >
              <option value="">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.slug}>
                  {sector.name}
                </option>
              ))}
            </select>

            <select
              className="border border-(--color-border) rounded-md px-3 py-2 text-sm"
              value={filters.roomType}
              onChange={(e) => setFilters((prev) => ({ ...prev, roomType: e.target.value }))}
            >
              <option value="">All Room Types</option>
              {ROOM_TYPES.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.includeInactive}
                onChange={(e) => setFilters((prev) => ({ ...prev, includeInactive: e.target.checked }))}
              />
              Include inactive
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => load(1)}>Apply filters</Button>
          </div>
        </div>

        {loading ? <div className="text-sm text-muted">Loading…</div> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((image) => (
            <div key={image.id} className="border border-(--color-border) rounded-lg overflow-hidden">
              <div className="aspect-4/3 bg-black/5 relative">
                <Image
                  src={image.url}
                  alt={image.altText || 'Gallery image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="font-medium truncate">{image.caption || image.altText || 'Untitled image'}</div>
                <div className="text-xs text-muted">Album: {image.album}</div>
                <div className="text-xs text-muted">
                  {image.roomType ? `Room: ${image.roomType}` : 'Room: —'} • {image.floor !== null && image.floor !== undefined ? `Floor: ${image.floor}` : 'Floor: —'}
                </div>
                <div className="text-xs text-muted">Availability: {image.availability || '—'}</div>
                <div className="text-xs text-muted">Active: {image.isActive ? 'Yes' : 'No'} • Featured: {image.isFeatured ? 'Yes' : 'No'}</div>

                {canWrite ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateImage(image.id, { isActive: !image.isActive })}
                    >
                      {image.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateImage(image.id, { isFeatured: !image.isFeatured })}
                    >
                      {image.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                    {canDelete ? (
                      <Button size="sm" variant="outline" onClick={() => deleteImage(image.id)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {!loading && rows.length === 0 ? <div className="text-sm text-muted">No images found.</div> : null}

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

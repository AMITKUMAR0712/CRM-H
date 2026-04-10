'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

const schema = z.object({
  name: z.string().min(3).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  metroStation: z.string().optional(),
  metroDistance: z.coerce.number().min(0).optional(),
  highlights: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isActive: z.boolean().optional(),
})

type FormValues = z.input<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

type SectorDetails = {
  id: string
  name: string
  slug: string
  description: string | null
  metroStation: string | null
  metroDistance: number | null
  highlights: string[] | null
  latitude: number | null
  longitude: number | null
  isActive: boolean
}

export default function EditLocationPage() {
  const params = useParams<{ id?: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.SECTOR_WRITE) : false
  const canDelete = role ? hasPermission(role, PERMISSIONS.SECTOR_DELETE) : false

  const id = params?.id ?? ''

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-sector', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/sectors/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<SectorDetails>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load location')
      return json.data
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  React.useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        slug: data.slug,
        description: data.description ?? '',
        metroStation: data.metroStation ?? '',
        metroDistance: data.metroDistance ?? undefined,
        highlights: data.highlights ? data.highlights.join(', ') : '',
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        isActive: data.isActive,
      })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    const highlights = payload.highlights
      ? payload.highlights.split(',').map((h) => h.trim()).filter(Boolean)
      : undefined

    const res = await fetch(`/api/admin/sectors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, highlights }),
    })

    const json = (await res.json()) as ApiResponse<SectorDetails>
    if (!res.ok || !json.success) {
      setError('slug', { message: 'error' in json ? json.error : 'Failed to update location' })
      return
    }

    await refetch()
  }

  const onDelete = async () => {
    if (!canDelete) return
    const ok = window.confirm('Delete this location? This cannot be undone.')
    if (!ok) return

    const res = await fetch(`/api/admin/sectors/${id}`, { method: 'DELETE' })
    const json = (await res.json()) as ApiResponse<null>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to delete location')
      return
    }

    router.push('/admin/locations')
  }

  if (!id) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">Location ID is missing.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit Location</h1>
          <p className="text-sm text-muted">Update sector details and availability.</p>
        </div>
        {canDelete ? (
          <Button variant="outline" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
            Delete
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <fieldset disabled={!canWrite} className={!canWrite ? 'opacity-70' : undefined}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Name</label>
                  <Input {...register('name')} />
                  {errors.name?.message ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Slug</label>
                  <Input {...register('slug')} />
                  {errors.slug?.message ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Metro Station</label>
                  <Input {...register('metroStation')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Metro Distance (km)</label>
                  <Input type="number" step="0.1" {...register('metroDistance')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input type="number" step="0.0001" {...register('latitude')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input type="number" step="0.0001" {...register('longitude')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Highlights (comma separated)</label>
                <Input {...register('highlights')} />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('isActive')} /> Active
              </label>

              </fieldset>

              <div className="flex items-center gap-2">
                {canWrite ? (
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Changes'}</Button>
                ) : (
                  <span className="text-sm text-muted">Read only</span>
                )}
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

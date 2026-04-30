'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'


const schema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  metroStation: z.string().optional(),
  metroDistance: z.coerce.number().min(0).optional(),
  highlights: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.input<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

export default function NewLocationPage() {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canCreate = role ? hasPermission(role, PERMISSIONS.SECTOR_WRITE) : false

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    const highlights = payload.highlights
      ? payload.highlights.split(',').map((h) => h.trim()).filter(Boolean)
      : undefined

    setSaving(true)
    try {
      const res = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, highlights }),
      })

      const json = (await res.json()) as ApiResponse<{ id: string }>
      if (!res.ok || !json.success) {
        setError('slug', { message: 'error' in json ? json.error : 'Failed to create location' })
        return
      }

      router.push(`/admin/locations/${json.data.id}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to create locations.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add Location</h1>
        <p className="text-sm text-muted">Create a new sector with metro and map details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input {...register('name')} />
                {errors.name?.message ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <Input {...register('slug')} placeholder="sector-62" />
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
                <Input {...register('metroStation')} placeholder="Sector 62 Metro" />
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
              <Input {...register('highlights')} placeholder="Near IT parks, Metro access, Safe locality" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isActive')} /> Active
            </label>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Location'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

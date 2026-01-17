'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const schema = z.object({
  name: z.string().min(3).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  address: z.string().min(10).optional(),
  description: z.string().optional(),
  monthlyRent: z.coerce.number().min(1000).optional(),
  totalRooms: z.coerce.number().min(1).optional(),
  availableRooms: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

type FormValues = z.input<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

type PgDetails = {
  id: string
  name: string
  slug: string
  address: string
  description: string | null
  monthlyRent: number
  totalRooms: number
  availableRooms: number
  isActive: boolean
  isFeatured: boolean
  metaTitle: string | null
  metaDescription: string | null
}

export default function EditPgPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pg', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/pgs/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<PgDetails>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load PG')
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
        address: data.address,
        description: data.description ?? '',
        monthlyRent: data.monthlyRent,
        totalRooms: data.totalRooms,
        availableRooms: data.availableRooms,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle ?? '',
        metaDescription: data.metaDescription ?? '',
      })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    const res = await fetch(`/api/admin/pgs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await res.json()) as ApiResponse<PgDetails>
    if (!res.ok || !json.success) {
      setError('slug', { message: 'error' in json ? json.error : 'Failed to update PG' })
      return
    }

    await refetch()
  }

  const onDelete = async () => {
    const ok = window.confirm('Delete this PG? This cannot be undone.')
    if (!ok) return

    const res = await fetch(`/api/admin/pgs/${id}`, { method: 'DELETE' })
    const json = (await res.json()) as ApiResponse<null>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to delete PG')
      return
    }

    router.push('/admin/pgs')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit PG</h1>
          <p className="text-sm text-[var(--color-muted)]">Update listing, availability, and SEO fields.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          <Button variant="outline" onClick={onDelete}>Delete</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : error ? (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="text-sm font-medium">Address</label>
                <Textarea {...register('address')} />
                {errors.address?.message ? <p className="text-sm text-red-600">{errors.address.message}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register('description')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Monthly Rent</label>
                  <Input type="number" {...register('monthlyRent')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Total Rooms</label>
                  <Input type="number" {...register('totalRooms')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Available Rooms</label>
                  <Input type="number" {...register('availableRooms')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isActive')} /> Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isFeatured')} /> Featured
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meta Title</label>
                  <Input {...register('metaTitle')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meta Description</label>
                  <Textarea {...register('metaDescription')} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save changes'}</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

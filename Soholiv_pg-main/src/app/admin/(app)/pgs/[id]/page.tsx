'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

const schema = z.object({
  name: z.string().min(3).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  address: z.string().min(10).optional(),
  description: z.string().optional(),
  monthlyRent: z.coerce.number().min(1000).optional(),
  totalRooms: z.coerce.number().min(1).optional(),
  availableRooms: z.coerce.number().min(0).optional(),
  securityDeposit: z.coerce.number().optional(),
  isAvailable: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasGym: z.boolean().optional(),
  hasPowerBackup: z.boolean().optional(),
  hasLaundry: z.boolean().optional(),
  hasTV: z.boolean().optional(),
  hasFridge: z.boolean().optional(),
  mealsIncluded: z.boolean().optional(),
  mealsPerDay: z.coerce.number().optional(),
  gateClosingTime: z.string().optional(),
  noticePeriod: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'BLOCKED']).optional(),
  blockedReason: z.string().max(2000).optional(),
  categoryIds: z.array(z.string()).optional(),
  assignedManagerIds: z.array(z.string()).optional(),
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
  securityDeposit: number | null
  totalRooms: number
  availableRooms: number
  isAvailable: boolean
  createdById?: string | null
  hasAC: boolean
  hasWifi: boolean
  hasParking: boolean
  hasGym: boolean
  hasPowerBackup: boolean
  hasLaundry: boolean
  hasTV: boolean
  hasFridge: boolean
  mealsIncluded: boolean
  mealsPerDay: number | null
  gateClosingTime: string | null
  noticePeriod: number | null
  isActive: boolean
  isFeatured: boolean
  metaTitle: string | null
  metaDescription: string | null
  approvalStatus?: 'PENDING' | 'APPROVED' | 'BLOCKED'
  blockedReason?: string | null
  categories?: Array<{ category: { id: string; name: string; slug: string } }>
  assignments?: Array<{ user: { id: string; name: string; email: string } }>
}

export default function EditPgPage() {
  const params = useParams<{ id?: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([])
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canApprove = role ? hasPermission(role, PERMISSIONS.PG_APPROVE) : false
  const canCreate = role ? hasPermission(role, PERMISSIONS.SECTOR_WRITE) : false
  const canWrite = role ? hasPermission(role, PERMISSIONS.PG_WRITE) : false
  const canAssignManagers = role ? hasPermission(role, PERMISSIONS.USER_READ) : false
  const canReadCategories = role ? hasPermission(role, PERMISSIONS.SMART_CATEGORY_READ) : false
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pg', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/pgs/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<PgDetails>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load PG')
      return json.data
    },
  })

  const isOwner = Boolean(data?.createdById && session?.user?.id && data.createdById === session.user.id)
  const canDelete = role ? hasPermission(role, PERMISSIONS.PG_DELETE) : false

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const [managerOptions, setManagerOptions] = React.useState<Array<{ id: string; name: string; email: string }>>([])

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
        securityDeposit: data.securityDeposit ?? undefined,
        isAvailable: data.isAvailable,
        hasAC: data.hasAC,
        hasWifi: data.hasWifi,
        hasParking: data.hasParking,
        hasGym: data.hasGym,
        hasPowerBackup: data.hasPowerBackup,
        hasLaundry: data.hasLaundry,
        hasTV: data.hasTV,
        hasFridge: data.hasFridge,
        mealsIncluded: data.mealsIncluded,
        mealsPerDay: data.mealsPerDay ?? undefined,
        gateClosingTime: data.gateClosingTime ?? '',
        noticePeriod: data.noticePeriod ?? undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle ?? '',
        metaDescription: data.metaDescription ?? '',
        approvalStatus: data.approvalStatus ?? 'PENDING',
        blockedReason: data.blockedReason ?? '',
        categoryIds: data.categories?.map((c) => c.category.id) ?? [],
        assignedManagerIds: data.assignments?.map((a) => a.user.id) ?? [],
      })
    }
  }, [data, reset])

  React.useEffect(() => {
    if (!canReadCategories) return

    async function fetchCategories() {
      const res = await fetch('/api/admin/smart-categories?limit=200&includeInactive=true')
      const json = await res.json()
      if (res.ok && json.success) {
        setCategories((json.data || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      }
    }

    void fetchCategories()
  }, [canReadCategories])

  React.useEffect(() => {
    if (!canAssignManagers) return

    async function fetchManagers() {
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (res.ok && json.success) {
        const managers = (json.data || []).filter((u: { role?: string }) => u.role === 'MANAGER')
        setManagerOptions(managers.map((u: { id: string; name: string; email: string }) => ({ id: u.id, name: u.name, email: u.email })))
      }
    }

    void fetchManagers()
  }, [canAssignManagers])

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    if (!canReadCategories) {
      delete (payload as FormValues & { categoryIds?: string[] }).categoryIds
    }
    if (!canAssignManagers) {
      delete (payload as FormValues & { assignedManagerIds?: string[] }).assignedManagerIds
    }
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

  if (!id) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">PG ID is missing.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit PG</h1>
          <p className="text-sm text-muted">Update listing, availability, and SEO fields.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          {canDelete ? <Button variant="outline" onClick={onDelete}>Delete</Button> : null}
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
                <label className="text-sm font-medium">Address</label>
                <Textarea {...register('address')} />
                {errors.address?.message ? <p className="text-sm text-red-600">{errors.address.message}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea {...register('description')} />
              </div>

              {canApprove ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Approval</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        className="w-full rounded-md border border-(--color-border) px-3 py-2 text-sm"
                        {...register('approvalStatus')}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Blocked Reason</label>
                      <Input placeholder="Reason for blocking" {...register('blockedReason')} />
                    </div>
                  </div>
                </div>
              ) : null}

              {canReadCategories ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Smart Finder Categories</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" value={category.id} {...register('categoryIds')} />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {canAssignManagers ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Assigned Managers</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {managerOptions.length ? (
                      managerOptions.map((manager) => (
                        <label key={manager.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" value={manager.id} {...register('assignedManagerIds')} />
                          {manager.name} <span className="text-xs text-muted">({manager.email})</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-xs text-muted">No managers available.</span>
                    )}
                  </div>
                </div>
              ) : null}

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
                <div className="space-y-1">
                  <label className="text-sm font-medium">Security Deposit</label>
                  <Input type="number" {...register('securityDeposit')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Gate Closing Time</label>
                  <Input {...register('gateClosingTime')} placeholder="10:30 PM" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isAvailable')} /> Available
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasWifi')} /> WiFi
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('mealsIncluded')} /> Meals Included
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasAC')} /> AC
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasParking')} /> Parking
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasGym')} /> Gym
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasPowerBackup')} /> Power Backup
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasLaundry')} /> Laundry
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasTV')} /> TV
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('hasFridge')} /> Fridge
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meals Per Day</label>
                  <Input type="number" {...register('mealsPerDay')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Notice Period (days)</label>
                  <Input type="number" {...register('noticePeriod')} />
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
              </fieldset>

              <div className="flex items-center gap-2">
                {canWrite ? (
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save changes'}</Button>
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

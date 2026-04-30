'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'


const schema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  sectorId: z.string().min(1),
  address: z.string().min(10),
  description: z.string().optional(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING']),
  occupancyType: z.enum(['BOYS', 'GIRLS', 'CO_LIVING']),
  monthlyRent: z.coerce.number().min(1000),
  securityDeposit: z.coerce.number().optional(),
  totalRooms: z.coerce.number().min(1),
  availableRooms: z.coerce.number().min(0),
  isAvailable: z.boolean().default(true),
  hasAC: z.boolean().default(false),
  hasWifi: z.boolean().default(true),
  hasParking: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  hasPowerBackup: z.boolean().default(true),
  hasLaundry: z.boolean().default(false),
  hasTV: z.boolean().default(false),
  hasFridge: z.boolean().default(false),
  mealsIncluded: z.boolean().default(false),
  mealsPerDay: z.coerce.number().optional(),
  gateClosingTime: z.string().optional(),
  noticePeriod: z.coerce.number().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.string()).optional(),
})

type FormValues = z.input<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

export default function NewPgPage() {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)
  const [categories, setCategories] = React.useState<Array<{ id: string; name: string }>>([])
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.PG_WRITE) : false
  const canReadCategories = role ? hasPermission(role, PERMISSIONS.SMART_CATEGORY_READ) : false

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomType: 'DOUBLE',
      occupancyType: 'BOYS',
      isAvailable: true,
      hasWifi: true,
      isActive: true,
      isFeatured: false,
      totalRooms: 10,
      availableRooms: 5,
      monthlyRent: 12000,
      mealsIncluded: false,
      hasAC: false,
      hasParking: false,
      hasGym: false,
      hasPowerBackup: true,
      hasLaundry: false,
      hasTV: false,
      hasFridge: false,
      categoryIds: [],
    },
  })

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

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    if (!canReadCategories) {
      delete (payload as FormValues & { categoryIds?: string[] }).categoryIds
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as ApiResponse<{ id: string }>
      if (!res.ok || !json.success) {
        setError('slug', { message: 'error' in json ? json.error : 'Failed to create PG' })
        return
      }

      router.push(`/admin/pgs/${json.data.id}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!canWrite) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to create PGs.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create PG</h1>
        <p className="text-sm text-muted">Create a new PG listing with pricing, availability and SEO.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic</CardTitle>
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
                <Input {...register('slug')} placeholder="soho-sector-51" />
                {errors.slug?.message ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Sector ID</label>
                <Input {...register('sectorId')} placeholder="cuid…" />
                {errors.sectorId?.message ? <p className="text-sm text-red-600">{errors.sectorId.message}</p> : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Monthly Rent (INR)</label>
                <Input type="number" {...register('monthlyRent')} />
                {errors.monthlyRent?.message ? <p className="text-sm text-red-600">{errors.monthlyRent.message}</p> : null}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Room Type</label>
                <select className="h-12 w-full rounded-lg border border-(--color-border) bg-white px-4" {...register('roomType')}>
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TRIPLE">TRIPLE</option>
                  <option value="FOUR_SHARING">FOUR_SHARING</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Occupancy</label>
                <select className="h-12 w-full rounded-lg border border-(--color-border) bg-white px-4" {...register('occupancyType')}>
                  <option value="BOYS">BOYS</option>
                  <option value="GIRLS">GIRLS</option>
                  <option value="CO_LIVING">CO_LIVING</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('isAvailable')} /> Available
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('hasWifi')} /> WiFi
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('mealsIncluded')} /> Meals Included
              </label>
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
              <div className="space-y-1">
                <label className="text-sm font-medium">Security Deposit</label>
                <Input type="number" {...register('securityDeposit')} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Gate Closing Time</label>
                <Input {...register('gateClosingTime')} placeholder="10:30 PM" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create PG'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

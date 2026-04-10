'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'


type SectorRow = {
  id: string
  name: string
  slug: string
  metroStation: string | null
  metroDistance: number | null
  isActive: boolean
  _count: { pgs: number }
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string }

export default function AdminLocationsPage() {
  const [search, setSearch] = React.useState('')
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.SECTOR_WRITE) : false
  const canCreate = role ? hasPermission(role, PERMISSIONS.SECTOR_WRITE) : false

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-sectors', search],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      qs.set('limit', '25')

      const res = await fetch(`/api/admin/sectors?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<SectorRow[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load locations')
      return json.data
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Locations</h1>
          <p className="text-sm text-muted">Manage sectors, metro details, and activation status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          {canCreate ? (
            <Button asChild>
              <Link href="/admin/locations/new">Add Location</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, slug, or description" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locations</CardTitle>
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
          ) : !data?.length ? (
            <p className="text-sm text-muted">No locations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="py-2">Name</th>
                    <th className="py-2">Metro</th>
                    <th className="py-2">PGs</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((sector) => (
                    <tr key={sector.id} className="border-b border-(--color-border)">
                      <td className="py-2">
                        <div className="font-medium">{sector.name}</div>
                        <div className="text-xs text-muted">{sector.slug}</div>
                      </td>
                      <td className="py-2">
                        {sector.metroStation ? (
                          <div>
                            <div>{sector.metroStation}</div>
                            {sector.metroDistance != null ? (
                              <div className="text-xs text-muted">{sector.metroDistance} km</div>
                            ) : null}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2">{sector._count?.pgs ?? 0}</td>
                      <td className="py-2">
                        <span className="text-xs">{sector.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-2">
                        {canWrite ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/locations/${sector.id}`}>Edit</Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted">Read only</span>
                        )}
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

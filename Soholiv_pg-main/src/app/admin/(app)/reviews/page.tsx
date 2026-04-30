'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS, UserRole } from '@/lib/rbac'


const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
]

type ReviewRow = {
  id: string
  name: string
  rating: number
  comment: string
  isApproved: boolean
  isFeatured: boolean
  isVerified: boolean
  createdAt: string
  pg: { id: string; name: string; slug: string } | null
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string }

export default function AdminReviewsPage() {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canModerate = role ? hasPermission(role, PERMISSIONS.REVIEW_MODERATE) : false
  const canDelete = role ? hasPermission(role, PERMISSIONS.REVIEW_DELETE) : false
  const canRead = role ? hasPermission(role, PERMISSIONS.REVIEW_READ) : false

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reviews', search, status],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      if (status !== 'all') qs.set('status', status)
      qs.set('limit', '25')

      const res = await fetch(`/api/admin/reviews?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<ReviewRow[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load feedback')
      return json.data
    },
  })

  const updateReview = async (id: string, payload: Partial<Pick<ReviewRow, 'isApproved' | 'isFeatured' | 'isVerified'>>) => {
    if (!canModerate) return
    const res = await fetch(`/api/reviews?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await res.json()) as ApiResponse<ReviewRow>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to update feedback')
      return
    }

    await refetch()
  }

  const deleteReview = async (id: string) => {
    if (!canDelete) return
    const ok = window.confirm('Delete this feedback? This cannot be undone.')
    if (!ok) return

    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    const json = (await res.json()) as ApiResponse<null>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to delete feedback')
      return
    }

    await refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Feedback</h1>
          <p className="text-sm text-muted">Approve, feature, and verify reviews.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, comment, or PG" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-12 w-full md:w-48 rounded-lg border border-(--color-border) bg-white px-4"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {canRead ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviews</CardTitle>
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
            <p className="text-sm text-muted">No feedback found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="py-2">Name</th>
                    <th className="py-2">Rating</th>
                    <th className="py-2">PG</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((review) => (
                    <tr key={review.id} className="border-b border-(--color-border)">
                      <td className="py-2">
                        <div className="font-medium">{review.name}</div>
                        <div className="text-xs text-muted line-clamp-1">{review.comment}</div>
                      </td>
                      <td className="py-2">{review.rating} ★</td>
                      <td className="py-2">{review.pg?.name ?? '—'}</td>
                      <td className="py-2">
                        <div className="text-xs">
                          {review.isApproved ? 'Approved' : 'Pending'}
                          {review.isFeatured ? ' • Featured' : ''}
                          {review.isVerified ? ' • Verified' : ''}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {canModerate ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReview(review.id, { isApproved: !review.isApproved })}
                              >
                                {review.isApproved ? 'Unapprove' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReview(review.id, { isFeatured: !review.isFeatured })}
                              >
                                {review.isFeatured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReview(review.id, { isVerified: !review.isVerified })}
                              >
                                {review.isVerified ? 'Unverify' : 'Verify'}
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted">Read only</span>
                          )}
                          {canDelete ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => deleteReview(review.id)}
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        <Card className="p-5">
          <div className="text-sm text-muted">You do not have permission to view reviews.</div>
        </Card>
      )}
    </div>
  )
}

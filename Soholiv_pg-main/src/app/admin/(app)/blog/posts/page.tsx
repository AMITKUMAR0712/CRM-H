'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

type Post = {
  id: string
  title: string
  slug: string
  status: string
  viewCount: number
  createdAt: string
  publishedAt: string | null
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string }

export default function AdminBlogPostsPage() {
  const [search, setSearch] = React.useState('')
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.BLOG_WRITE) : false

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-blog-posts', search],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      qs.set('limit', '25')

      const res = await fetch(`/api/admin/blog/posts?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<Post[]>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load posts')
      return json.data
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts</h1>
          <p className="text-sm text-muted">Draft, publish, and optimize SEO.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          {canWrite ? (
            <Button asChild>
              <Link href="/admin/blog/posts/new">New Post</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title/excerpt" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Posts</CardTitle>
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
            <p className="text-sm text-muted">No posts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-(--color-border)">
                    <th className="py-2">Title</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Views</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p.id} className="border-b border-(--color-border)">
                      <td className="py-2">
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted">{p.slug}</div>
                      </td>
                      <td className="py-2">{p.status}</td>
                      <td className="py-2">{p.viewCount}</td>
                      <td className="py-2">
                        {canWrite ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/blog/posts/${p.id}`}>Edit</Link>
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

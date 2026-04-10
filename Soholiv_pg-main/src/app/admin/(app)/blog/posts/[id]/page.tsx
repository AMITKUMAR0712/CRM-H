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
import RichTextEditor from '@/components/admin/blog/RichTextEditor'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

const schema = z.object({
  title: z.string().min(5).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  focusKeyword: z.string().max(100).optional(),
})

type FormValues = z.infer<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

type PostDetails = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isFeatured: boolean
  metaTitle: string | null
  metaDescription: string | null
  focusKeyword: string | null
}

export default function EditPostPage() {
  const params = useParams<{ id?: string }>()
  const router = useRouter()
  const id = params?.id ?? ''
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canDelete = role ? hasPermission(role, PERMISSIONS.BLOG_DELETE) : false
  const canPublish = role ? hasPermission(role, PERMISSIONS.BLOG_PUBLISH) : false
  const canWrite = role ? hasPermission(role, PERMISSIONS.BLOG_WRITE) : false

  const postQuery = useQuery({
    queryKey: ['admin-post', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/blog/posts/${id}`, { cache: 'no-store' })
      const json = (await res.json()) as ApiResponse<PostDetails>
      if (!res.ok || !json.success) throw new Error('error' in json ? json.error : 'Failed to load post')
      return json.data
    },
  })

  const [editorValue, setEditorValue] = React.useState('<p></p>')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  React.useEffect(() => {
    if (!postQuery.data) return
    reset({
      title: postQuery.data.title,
      slug: postQuery.data.slug,
      excerpt: postQuery.data.excerpt ?? '',
      content: postQuery.data.content,
      status: postQuery.data.status,
      isFeatured: postQuery.data.isFeatured,
      metaTitle: postQuery.data.metaTitle ?? '',
      metaDescription: postQuery.data.metaDescription ?? '',
      focusKeyword: postQuery.data.focusKeyword ?? '',
    })
    setEditorValue(postQuery.data.content || '<p></p>')
  }, [postQuery.data, reset])

  React.useEffect(() => {
    setValue('content', editorValue)
  }, [editorValue, setValue])

  const onSubmit = async (values: FormValues) => {
    const res = await fetch(`/api/admin/blog/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    const json = (await res.json()) as ApiResponse<PostDetails>
    if (!res.ok || !json.success) {
      setError('slug', { message: 'error' in json ? json.error : 'Failed to update post' })
      return
    }

    await postQuery.refetch()
  }

  const onDelete = async () => {
    const ok = window.confirm('Delete this post? This cannot be undone.')
    if (!ok) return

    const res = await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' })
    const json = (await res.json()) as ApiResponse<null>
    if (!res.ok || !json.success) {
      alert('error' in json ? json.error : 'Failed to delete post')
      return
    }

    router.push('/admin/blog/posts')
    router.refresh()
  }

  if (!id) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">Post ID is missing.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
          <p className="text-sm text-muted">Update content, SEO and publish state.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => postQuery.refetch()}>Refresh</Button>
          {canDelete ? <Button variant="outline" onClick={onDelete}>Delete</Button> : null}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {postQuery.isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : postQuery.error ? (
            <p className="text-sm text-red-600">{(postQuery.error as Error).message}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <fieldset disabled={!canWrite} className={!canWrite ? 'opacity-70' : undefined}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <Input {...register('title')} />
                  {errors.title?.message ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Slug</label>
                  <Input {...register('slug')} />
                  {errors.slug?.message ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {canPublish ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Status</label>
                    <select className="h-12 w-full rounded-lg border border-(--color-border) bg-white px-4" {...register('status')}>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                ) : null}
                <label className="flex items-center gap-2 text-sm mt-8">
                  <input type="checkbox" {...register('isFeatured')} /> Featured
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Excerpt</label>
                <Textarea {...register('excerpt')} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Body</label>
                <RichTextEditor value={editorValue} onChange={setEditorValue} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Meta Title</label>
                  <Input {...register('metaTitle')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Focus Keyword</label>
                  <Input {...register('focusKeyword')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea {...register('metaDescription')} />
              </div>
              </fieldset>

              <div className="flex items-center gap-2">
                {canWrite ? (
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
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

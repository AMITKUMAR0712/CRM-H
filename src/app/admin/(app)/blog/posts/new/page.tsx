'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import RichTextEditor from '@/components/admin/blog/RichTextEditor'
import { hasPermission, PERMISSIONS } from '@/lib/rbac'

const schema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(50),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  focusKeyword: z.string().max(100).optional(),
})

 type FormValues = z.input<typeof schema>

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

export default function NewPostPage() {
  const router = useRouter()
  const [editorValue, setEditorValue] = React.useState('<p></p>')
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canWrite = role ? hasPermission(role, PERMISSIONS.BLOG_WRITE) : false

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'DRAFT',
      isFeatured: false,
      content: '<p></p>',
    },
  })

  React.useEffect(() => {
    setValue('content', editorValue, { shouldValidate: true })
  }, [editorValue, setValue])

  const onSubmit = async (values: FormValues) => {
    const payload = schema.parse(values)
    const res = await fetch('/api/admin/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await res.json()) as ApiResponse<{ id: string }>
    if (!res.ok || !json.success) {
      setError('slug', { message: 'error' in json ? json.error : 'Failed to create post' })
      return
    }

    router.push(`/admin/blog/posts/${json.data.id}`)
    router.refresh()
  }

  if (!canWrite) {
    return (
      <Card className="p-5">
        <div className="text-sm text-muted">You do not have permission to create blog posts.</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New Blog Post</h1>
        <p className="text-sm text-muted">Write and publish SEO-optimized content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input {...register('title')} />
                {errors.title?.message ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <Input {...register('slug')} placeholder="pg-in-sector-51" />
                {errors.slug?.message ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea {...register('excerpt')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select className="h-12 w-full rounded-lg border border-(--color-border) bg-white px-4" {...register('status')}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm mt-8">
                <input type="checkbox" {...register('isFeatured')} /> Featured
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Body</label>
              <RichTextEditor value={editorValue} onChange={setEditorValue} />
              {errors.content?.message ? <p className="text-sm text-red-600">{errors.content.message}</p> : null}
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

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create Post'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

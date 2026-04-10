import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import prisma from '@/lib/prisma'
import PageRenderer from '@/components/cms/PageRenderer'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const page = await prisma.page.findFirst({
    where: { slug, deletedAt: null, isActive: true, status: 'PUBLISHED' },
    select: { title: true, metaTitle: true, metaDescription: true, ogImageUrl: true },
  })

  if (!page) return {}

  const title = page.metaTitle || page.title
  const description = page.metaDescription || undefined

  return {
    title,
    description,
    openGraph: page.ogImageUrl
      ? {
          title,
          description,
          images: [{ url: page.ogImageUrl }],
        }
      : undefined,
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Redirect static pages to their direct routes to avoid CMS overrides
  if (['about', 'privacy', 'terms', 'faqs'].includes(slug)) {
    redirect(`/${slug}`)
  }

  const page = await prisma.page.findFirst({
    where: { slug, deletedAt: null, isActive: true, status: 'PUBLISHED' },
    select: { title: true, content: true },
  })

  if (!page) return notFound()

  return <PageRenderer title={page.title} content={page.content} />
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/layout/PageHero'
import prisma from '@/lib/prisma'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

type Props = {
    params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: { select: { name: true, avatar: true } },
                category: { select: { name: true, slug: true } },
                tags: { include: { tag: true } },
            },
        })

        return post
    } catch (err) {
        console.error('[Blog] Failed to load post', err)
        return null
    }
}

async function getRelatedPosts(categoryId: string | null, currentSlug: string) {
    if (!categoryId) return []

    try {
        const posts = await prisma.blogPost.findMany({
            where: {
                status: 'PUBLISHED',
                categoryId,
                slug: { not: currentSlug },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
                publishedAt: true,
                readTime: true,
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
        })

        return posts
    } catch (err) {
        console.error('[Blog] Failed to load related posts', err)
        return []
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) return { title: 'Post Not Found' }

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            type: 'article',
            publishedTime: post.publishedAt?.toISOString(),
            images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
        },
    }
}

export async function generateStaticParams() {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true },
        })

        return posts.map((post) => ({ slug: post.slug }))
    } catch (err) {
        console.error('[Blog] Failed to build static params', err)
        return []
    }
}

function formatDate(date: Date | null) {
    if (!date) return ''
    return date.toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post || post.status !== 'PUBLISHED') {
        notFound()
    }

    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
        try {
            await prisma.blogPost.update({
                where: { id: post.id },
                data: { viewCount: { increment: 1 } },
            })
        } catch (err) {
            console.error('[Blog] Failed to increment view count', err)
        }
    }

    const relatedPosts = await getRelatedPosts(post.categoryId, slug)

    // Article JSON-LD Schema
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || post.metaDescription,
        image: post.featuredImage || undefined,
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        author: {
            '@type': 'Person',
            name: post.author.name,
        },
        publisher: {
            '@type': 'Organization',
            name: 'SOHO PG',
            logo: {
                '@type': 'ImageObject',
                url: 'https://sohopg.com/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://sohopg.com/blog/${post.slug}`,
        },
    }

    return (
        <>
            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <article>
                <PageHero
                    kicker={post.category?.name || 'Blog'}
                    title={post.title}
                    subtitle={post.excerpt || ''}
                    align="left"
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/blog">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Blog
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/smart-finder">Find a PG</Link>
                            </Button>
                        </>
                    }
                />

                <div className="container-custom pb-14">
                    <div className="mx-auto max-w-3xl">
                        {/* Meta row */}
                        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-(--color-muted)">
                            {post.category && <Badge className="mr-1">{post.category.name}</Badge>}
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.publishedAt)}
                            </div>
                            {post.readTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {post.readTime} min read
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {post.tags.map(({ tag }) => (
                                    <Badge key={tag.id} variant="outline">
                                        #{tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Featured Image */}
                        <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/26 to-transparent" />
                            {post.featuredImage ? (
                                <Image
                                    src={post.featuredImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 720px"
                                    priority
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-(--color-muted)">
                                    Featured Image
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-7 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.10)] md:p-10">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                            <div
                                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-(--color-graphite) prose-p:text-(--color-foreground) prose-a:text-(--color-clay) prose-strong:text-(--color-graphite)"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>

                        {/* Share */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 px-6 py-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-(--color-muted)">Share this article</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Share on WhatsApp"
                                        >
                                            WhatsApp
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" aria-label="Share">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-12">
                                <h3 className="font-serif text-2xl font-bold text-(--color-graphite) mb-6">Related Articles</h3>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {relatedPosts.map((relatedPost) => (
                                        <Link
                                            key={relatedPost.id}
                                            href={`/blog/${relatedPost.slug}`}
                                            className="group block rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            <div className="relative aspect-video bg-(--color-limestone)">
                                                {relatedPost.featuredImage ? (
                                                    <Image
                                                        src={relatedPost.featuredImage}
                                                        alt={relatedPost.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 240px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-(--color-muted) text-sm">
                                                        Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-medium text-(--color-graphite) line-clamp-2 group-hover:text-(--color-clay) transition-colors">
                                                    {relatedPost.title}
                                                </h4>
                                                <p className="mt-1 text-xs text-(--color-muted)">
                                                    {relatedPost.readTime && `${relatedPost.readTime} min read`}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="relative mt-8 overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 text-center backdrop-blur-md">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                            <h3 className="font-serif text-xl font-semibold text-(--color-graphite)">Looking for a PG in Noida?</h3>
                            <p className="mt-2 text-(--color-muted)">Use Smart Finder to shortlist options in minutes.</p>
                            <div className="mt-5 flex flex-wrap justify-center gap-3">
                                <Button asChild>
                                    <Link href="/smart-finder">Find Your PG</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/contact">Book a Visit</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </>
    )
}

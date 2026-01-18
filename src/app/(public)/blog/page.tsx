import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PageHero from '@/components/layout/PageHero'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
    title: 'Blog - Tips & Guides for PG Living',
    description: 'Helpful articles, tips, and guides for finding the best PG accommodation in Noida. Expert advice on PG living.',
}

async function getBlogPosts() {
    const posts = await prisma.blogPost.findMany({
        where: {
            status: 'PUBLISHED',
        },
        include: {
            category: { select: { name: true, slug: true } },
            author: { select: { name: true, avatar: true } },
        },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' },
        ],
        take: 20,
    })

    return posts
}

async function getCategories() {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
            _count: {
                select: { posts: { where: { status: 'PUBLISHED' } } },
            },
        },
        orderBy: { name: 'asc' },
    })

    return categories
}

function formatDate(date: Date | string | null) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function BlogPage() {
    const [posts, categories] = await Promise.all([getBlogPosts(), getCategories()])

    const featuredPost = posts.find((p) => p.isFeatured)
    const regularPosts = posts.filter((p) => !p.isFeatured)

    return (
        <div>
            <PageHero
                kicker="Blog"
                title="Tips & guides for PG living"
                subtitle="Short reads to help you choose the right PG, settle faster, and make the most of your stay."
                actions={
                    <>
                        <Button asChild>
                            <Link href="/smart-finder">Find a PG</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/contact">Talk to Us</Link>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 pb-10">
                    <Link
                        href="/blog"
                        className="rounded-full border border-(--color-clay)/40 bg-(--color-clay)/12 px-5 py-2 text-sm font-semibold text-(--color-clay) backdrop-blur-md transition-colors"
                    >
                        All
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.slug}`}
                            className="rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-5 py-2 text-sm font-semibold text-(--color-graphite) backdrop-blur-md transition-colors hover:bg-(--color-limestone)"
                        >
                            {category.name} ({category._count.posts})
                        </Link>
                    ))}
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <Link href={`/blog/${featuredPost.slug}`} className="group block pb-12">
                        <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.16)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                                <div className="relative aspect-video bg-(--color-limestone)">
                                    {featuredPost.featuredImage ? (
                                        <Image
                                            src={featuredPost.featuredImage}
                                            alt={featuredPost.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="text-(--color-muted)">Featured Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    {featuredPost.category && (
                                        <Badge className="self-start mb-4">{featuredPost.category.name}</Badge>
                                    )}
                                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-(--color-graphite) mb-4 group-hover:text-(--color-clay) transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-(--color-muted) mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-muted)">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {featuredPost.author.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(featuredPost.publishedAt)}
                                        </div>
                                        {featuredPost.readTime && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {featuredPost.readTime} min read
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 inline-flex items-center text-(--color-clay) font-semibold">
                                        Read article
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Post Grid */}
                {regularPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {regularPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group relative block overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.15)]"
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                                <div className="relative aspect-video bg-(--color-limestone)">
                                    {post.featuredImage ? (
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="text-(--color-muted)">Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    {post.category && (
                                        <Badge variant="outline" className="mb-3">
                                            {post.category.name}
                                        </Badge>
                                    )}
                                    <h3 className="font-serif text-lg font-semibold text-(--color-graphite) mb-2 group-hover:text-(--color-clay) transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-(--color-muted) mb-4 line-clamp-2">{post.excerpt}</p>
                                    <div className="flex items-center justify-between text-xs text-(--color-muted)">
                                        <span>{formatDate(post.publishedAt)}</span>
                                        {post.readTime && <span>{post.readTime} min read</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : !featuredPost && (
                    <div className="text-center py-16">
                        <p className="text-(--color-muted)">No blog posts published yet. Check back soon!</p>
                    </div>
                )}

                {/* CTA */}
                {posts.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-(--color-muted)">Looking for a PG in Noida?</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <Button asChild>
                                <Link href="/smart-finder">Find Your PG</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

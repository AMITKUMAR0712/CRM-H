import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, User, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PageHero from '@/components/layout/PageHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import prisma from '@/lib/prisma'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateCollectionPageSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = generatePageMetadata(
    'Blog - Tips & Guides for PG Living in Noida',
    'Helpful articles, tips, and guides for finding the best PG accommodation in Noida. Expert advice on PG living, room selection, and student life.',
    '/blog',
    ['PG blog', 'accommodation tips', 'student life', 'PG guides', 'Noida living tips', 'hostel advice']
)

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function getBlogPosts(category?: string, search?: string, page: number = 1) {
    const pageSize = 12
    const skip = (page - 1) * pageSize

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        status: 'PUBLISHED',
    }

    if (category) {
        const cat = await prisma.category.findUnique({ where: { slug: category } })
        if (cat) where.categoryId = cat.id
    }

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { excerpt: { contains: search } },
            { content: { contains: search } },
        ]
    }

    const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
            where,
            include: {
                category: { select: { name: true, slug: true } },
                author: { select: { name: true, avatar: true } },
            },
            orderBy: [
                { isFeatured: 'desc' },
                { publishedAt: 'desc' },
            ],
            skip,
            take: pageSize,
        }),
        prisma.blogPost.count({ where }),
    ])

    return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / pageSize),
    }
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

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams
    const category = typeof params.category === 'string' ? params.category : undefined
    const search = typeof params.search === 'string' ? params.search : undefined
    const pageNum = typeof params.page === 'string' ? parseInt(params.page) : 1

    const [{ posts, total, page, totalPages }, categories] = await Promise.all([
        getBlogPosts(category, search, pageNum),
        getCategories(),
    ])

    const featuredPost = !search && page === 1 ? posts.find((p) => p.isFeatured) : null
    const regularPosts = featuredPost ? posts.filter((p) => !p.isFeatured) : posts

    // Collection Page Schema
    const collectionSchema = generateCollectionPageSchema(
        'SOHO PG Blog',
        'Articles, tips, and guides for finding the best PG accommodation in Noida',
        '/blog',
        total
    )

    return (
        <>
            <JsonLd data={collectionSchema} />
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
                    {/* Search Bar */}
                    <div className="mb-8">
                        <form action="/blog" method="GET" className="max-w-xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                                <Input
                                    type="search"
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Search articles..."
                                    className="pl-12 h-12 text-base"
                                />
                            </div>
                            {category && <input type="hidden" name="category" value={category} />}
                        </form>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-2 pb-10">
                        <Link
                            href="/blog"
                            className={`rounded-full px-5 py-2 text-sm font-semibold backdrop-blur-md transition-colors ${!category
                                ? 'border border-[var(--color-clay)]/40 bg-[var(--color-clay)]/12 text-[var(--color-clay)]'
                                : 'border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 text-[var(--color-graphite)] hover:bg-[var(--color-limestone)]'
                                }`}
                        >
                            All
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/blog?category=${cat.slug}`}
                                className={`rounded-full px-5 py-2 text-sm font-semibold backdrop-blur-md transition-colors ${category === cat.slug
                                    ? 'border border-[var(--color-clay)]/40 bg-[var(--color-clay)]/12 text-[var(--color-clay)]'
                                    : 'border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 text-[var(--color-graphite)] hover:bg-[var(--color-limestone)]'
                                    }`}
                            >
                                {cat.name} ({cat._count.posts})
                            </Link>
                        ))}
                    </div>

                    {/* Search Results Info */}
                    {search && (
                        <div className="text-center mb-8">
                            <p className="text-[var(--color-muted)]">
                                {total} result{total !== 1 ? 's' : ''} for &quot;{search}&quot;
                            </p>
                            <Link href="/blog" className="text-[var(--color-clay)] text-sm hover:underline mt-2 inline-block">
                                Clear search
                            </Link>
                        </div>
                    )}

                    {/* Featured Post */}
                    {featuredPost && (
                        <Link href={`/blog/${featuredPost.slug}`} className="group block pb-12">
                            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/28 to-transparent" />
                                <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                                    <div className="relative aspect-video bg-[var(--color-limestone)]">
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
                                                <span className="text-[var(--color-muted)]">Featured Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col justify-center">
                                        {featuredPost.category && (
                                            <Badge className="self-start mb-4">{featuredPost.category.name}</Badge>
                                        )}
                                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-graphite)] mb-4 group-hover:text-[var(--color-clay)] transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-[var(--color-muted)] mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
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
                                        <div className="mt-6 inline-flex items-center text-[var(--color-clay)] font-semibold">
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
                                    className="group relative block overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 backdrop-blur-md shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/22 to-transparent" />
                                    <div className="relative aspect-video bg-[var(--color-limestone)]">
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
                                                <span className="text-[var(--color-muted)]">Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        {post.category && (
                                            <Badge variant="outline" className="mb-3">
                                                {post.category.name}
                                            </Badge>
                                        )}
                                        <h3 className="font-serif text-lg font-semibold text-[var(--color-graphite)] mb-2 group-hover:text-[var(--color-clay)] transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-[var(--color-muted)] mb-4 line-clamp-2">{post.excerpt}</p>
                                        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                                            <span>{formatDate(post.publishedAt)}</span>
                                            {post.readTime && <span>{post.readTime} min read</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-[var(--color-muted)]">
                                {search ? 'No articles match your search.' : 'No blog posts published yet. Check back soon!'}
                            </p>
                            {search && (
                                <Button asChild className="mt-4">
                                    <Link href="/blog">View All Articles</Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-2">
                            {page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), page: String(page - 1) }).toString()}`}>
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (page <= 3) {
                                        pageNum = i + 1
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = page - 2 + i
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), page: String(pageNum) }).toString()}`}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === pageNum
                                                ? 'bg-[var(--color-clay)] text-white'
                                                : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-limestone)]'
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    )
                                })}
                            </div>
                            {page < totalPages && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { search } : {}), page: String(page + 1) }).toString()}`}>
                                        Next
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    {posts.length > 0 && (
                        <div className="mt-12 text-center">
                            <p className="text-[var(--color-muted)]">Looking for a PG in Noida?</p>
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
        </>
    )
}

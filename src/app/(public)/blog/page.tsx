import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PageHero from '@/components/layout/PageHero'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Blog - Tips & Guides for PG Living',
    description: 'Helpful articles, tips, and guides for finding the best PG accommodation in Noida. Expert advice on PG living.',
}

// Sample blog posts
const posts = [
    {
        id: '1',
        slug: '10-tips-finding-best-pg-noida',
        title: '10 Tips for Finding the Best PG in Noida',
        excerpt: 'Finding the right PG can be challenging. Here are our top 10 tips to help you make the right choice.',
        category: 'Tips',
        author: 'SOHO Team',
        publishedAt: '2024-01-15',
        readTime: 5,
        featured: true,
    },
    {
        id: '2',
        slug: 'living-in-sector-51-complete-guide',
        title: 'Living in Noida Sector 51: A Complete Guide',
        excerpt: 'Everything you need to know about living in Sector 51 - transport, amenities, food options, and more.',
        category: 'Guides',
        author: 'SOHO Team',
        publishedAt: '2024-01-10',
        readTime: 8,
        featured: false,
    },
    {
        id: '3',
        slug: 'pg-vs-hostel-which-is-better',
        title: 'PG vs Hostel: Which is Better for You?',
        excerpt: 'Confused between PG and hostel? We break down the pros and cons to help you decide.',
        category: 'Tips',
        author: 'SOHO Team',
        publishedAt: '2024-01-05',
        readTime: 6,
        featured: false,
    },
    {
        id: '4',
        slug: 'how-to-adjust-new-city',
        title: 'How to Adjust to a New City as a PG Resident',
        excerpt: 'Moving to a new city can be overwhelming. Here are tips to help you settle in quickly.',
        category: 'Lifestyle',
        author: 'SOHO Team',
        publishedAt: '2024-01-01',
        readTime: 4,
        featured: false,
    },
]

const categories = ['All', 'Tips', 'Guides', 'Lifestyle', 'Noida']

export default function BlogPage() {
    const featuredPost = posts.find((p) => p.featured)
    const regularPosts = posts.filter((p) => !p.featured)

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
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-5 py-2 text-sm font-semibold text-(--color-graphite) backdrop-blur-md transition-colors hover:bg-(--color-limestone)"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <Link href={`/blog/${featuredPost.slug}`} className="group block pb-12">
                        <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.16)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                                <div className="aspect-video bg-(--color-limestone) flex items-center justify-center">
                                    <span className="text-(--color-muted)">Featured Image</span>
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    <Badge className="self-start mb-4">{featuredPost.category}</Badge>
                                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-(--color-graphite) mb-4 group-hover:text-(--color-clay) transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-(--color-muted) mb-6">{featuredPost.excerpt}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-muted)">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {featuredPost.author}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {featuredPost.readTime} min read
                                        </div>
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group relative block overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.15)]"
                        >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                            <div className="aspect-video bg-(--color-limestone) flex items-center justify-center">
                                <span className="text-(--color-muted)">Image</span>
                            </div>
                            <div className="p-6">
                                <Badge variant="outline" className="mb-3">
                                    {post.category}
                                </Badge>
                                <h3 className="font-serif text-lg font-semibold text-(--color-graphite) mb-2 group-hover:text-(--color-clay) transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-(--color-muted) mb-4 line-clamp-2">{post.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-(--color-muted)">
                                    <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                    <span>{post.readTime} min read</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
        <div className="section-padding">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        Blog
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
                        Tips, guides, and insights for finding and living in the perfect PG.
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="px-5 py-2 rounded-full text-sm font-medium bg-[var(--color-limestone)] text-[var(--color-graphite)] hover:bg-[var(--color-clay)] hover:text-white transition-colors"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="block mb-12 group"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="aspect-video lg:aspect-auto bg-[var(--color-limestone)] flex items-center justify-center">
                                <span className="text-[var(--color-muted)]">Featured Image</span>
                            </div>
                            <div className="p-8 flex flex-col justify-center">
                                <Badge className="self-start mb-4">{featuredPost.category}</Badge>
                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-graphite)] mb-4 group-hover:text-[var(--color-clay)] transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-[var(--color-muted)] mb-6">{featuredPost.excerpt}</p>
                                <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {featuredPost.author}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {featuredPost.readTime} min read
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Post Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="block bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group"
                        >
                            <div className="aspect-video bg-[var(--color-limestone)] flex items-center justify-center">
                                <span className="text-[var(--color-muted)]">Image</span>
                            </div>
                            <div className="p-6">
                                <Badge variant="outline" className="mb-3">{post.category}</Badge>
                                <h3 className="font-serif text-lg font-semibold text-[var(--color-graphite)] mb-2 group-hover:text-[var(--color-clay)] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-[var(--color-muted)] mb-4 line-clamp-2">{post.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
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

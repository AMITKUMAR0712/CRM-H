import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/layout/PageHero'

// Sample blog post data
const postsData: Record<string, {
    title: string
    excerpt: string
    content: string
    category: string
    author: string
    publishedAt: string
    readTime: number
}> = {
    '10-tips-finding-best-pg-noida': {
        title: '10 Tips for Finding the Best PG in Noida',
        excerpt: 'Finding the right PG can be challenging. Here are our top 10 tips to help you make the right choice.',
        content: `
      <p>Moving to a new city is exciting but finding the right accommodation can be stressful. Here are 10 tips to help you find the perfect PG in Noida:</p>
      
      <h2>1. Define Your Budget</h2>
      <p>Before you start looking, set a realistic budget. PG rents in Noida typically range from ₹5,000 to ₹15,000 depending on the location and amenities.</p>
      
      <h2>2. Choose the Right Location</h2>
      <p>Consider proximity to your workplace, metro stations, and essential services. Sectors 51, 62, and 50 are popular choices for working professionals.</p>
      
      <h2>3. Check the Amenities</h2>
    <p>Make a list of must-have amenities like AC, WiFi, meals, and parking. Don&apos;t compromise on essentials.</p>
      
      <h2>4. Visit Before Booking</h2>
      <p>Always visit the PG in person before making a decision. Photos can be misleading.</p>
      
      <h2>5. Talk to Current Residents</h2>
      <p>If possible, speak to current residents about their experience. They can give you honest feedback.</p>
      
      <h2>6. Read the Agreement Carefully</h2>
      <p>Understand all terms including deposit, notice period, and house rules before signing.</p>
      
      <h2>7. Check Food Quality</h2>
      <p>If meals are included, try the food during your visit to ensure it meets your expectations.</p>
      
      <h2>8. Verify Security Measures</h2>
      <p>Check for CCTV, biometric entry, and 24/7 security, especially for women's PG.</p>
      
      <h2>9. Inspect Cleanliness</h2>
      <p>Look at the bathrooms, kitchen, and common areas. Cleanliness reflects the management quality.</p>
      
      <h2>10. Trust Your Instincts</h2>
      <p>If something feels off, keep looking. The right PG should feel like a potential home.</p>
    `,
        category: 'Tips',
        author: 'SOHO Team',
        publishedAt: '2024-01-15',
        readTime: 5,
    },
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = postsData[slug]

    if (!post) return { title: 'Post Not Found' }

    return {
        title: post.title,
        description: post.excerpt,
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = postsData[slug]

    if (!post) {
        notFound()
    }

    return (
        <article>
            <PageHero
                kicker={post.category}
                title={post.title}
                subtitle={post.excerpt}
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
                        <Badge className="mr-1">{post.category}</Badge>
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime} min read
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/26 to-transparent" />
                        <div className="flex h-full w-full items-center justify-center text-(--color-muted)">Featured Image</div>
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
                            <Button variant="outline" size="sm" aria-label="Share">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

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
    )
}

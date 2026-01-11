import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
      <p>Make a list of must-have amenities like AC, WiFi, meals, and parking. Don't compromise on essentials.</p>
      
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
        <article className="section-padding">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-clay)] mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-10">
                        <Badge className="mb-4">{post.category}</Badge>
                        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-graphite)] mb-6">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime} min read
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="aspect-video bg-[var(--color-limestone)] rounded-2xl mb-10 flex items-center justify-center">
                        <span className="text-[var(--color-muted)]">Featured Image</span>
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[var(--color-graphite)] prose-p:text-[var(--color-muted)] prose-a:text-[var(--color-clay)]"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Share */}
                    <div className="border-t border-[var(--color-border)] mt-10 pt-8">
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-muted)]">Share this article</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-10 p-8 bg-[var(--color-limestone)] rounded-2xl text-center">
                        <h3 className="font-serif text-xl font-semibold mb-2">Looking for a PG in Noida?</h3>
                        <p className="text-[var(--color-muted)] mb-4">Let us help you find the perfect accommodation.</p>
                        <Button asChild>
                            <Link href="/smart-finder">Find Your PG</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    )
}

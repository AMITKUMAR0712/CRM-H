import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Sparkles, Users, ArrowRight, Camera, Utensils, Clock, Building, Star, Award, CheckCircle } from 'lucide-react'

import prisma from '@/lib/prisma'
import PageRenderer from '@/components/cms/PageRenderer'
import PageHero from '@/components/layout/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateOrganizationSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
    let page: { title: string; metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null } | null = null

    try {
        page = await prisma.page.findFirst({
            where: { slug: 'about', deletedAt: null, isActive: true, status: 'PUBLISHED' },
            select: { title: true, metaTitle: true, metaDescription: true, ogImageUrl: true },
        })
    } catch (err) {
        console.error('[About] Failed to load metadata', err)
    }

    if (!page) {
        return generatePageMetadata(
            'About SOHO PG - Premium PG Accommodation in Noida',
            'Learn about SOHO PG—premium PG living in Noida with a comfort-first, community-first approach. 5+ years of excellence in student and professional accommodation.',
            '/about',
            ['about SOHO PG', 'company info', 'our mission', 'PG provider Noida', 'accommodation services']
        )
    }

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

// Get review stats for trust signals
async function getReviewStats() {
    try {
        const stats = await prisma.review.aggregate({
            where: { isApproved: true },
            _avg: { rating: true },
            _count: true,
        })
        return {
            avgRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 4.8,
            totalReviews: stats._count || 50,
        }
    } catch (err) {
        console.error('[About] Failed to load review stats', err)
        return { avgRating: 4.8, totalReviews: 50 }
    }
}

export default async function AboutPage() {
    let page: { title: string; content: unknown } | null = null

    try {
        page = await prisma.page.findFirst({
            where: { slug: 'about', deletedAt: null, isActive: true, status: 'PUBLISHED' },
            select: { title: true, content: true },
        })
    } catch (err) {
        console.error('[About] Failed to load CMS content', err)
    }

    if (page) return <PageRenderer title={page.title} content={page.content} />

    const reviewStats = await getReviewStats()

    // Organization Schema
    const organizationSchema = generateOrganizationSchema()

    // CMS fallback (so About never 404s)
    return (
        <>
            <JsonLd data={organizationSchema} />
            <div>
                <PageHero
                    kicker="About SOHO PG"
                    title="A premium PG experience in Noida"
                    subtitle="Comfort, cleanliness, and a calm community—built for students and professionals who want a hassle‑free stay."
                    actions={
                        <>
                            <Button asChild>
                                <Link href="/smart-finder">Use Smart Finder</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/contact">Book a Visit</Link>
                            </Button>
                        </>
                    }
                />

                <div className="container-custom pb-14">
                    {/* Trust Signals */}
                    <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-6 rounded-2xl bg-[var(--color-alabaster)] border border-[var(--color-border)]">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                                <span className="text-3xl font-bold text-[var(--color-graphite)]">{reviewStats.avgRating}</span>
                            </div>
                            <p className="text-sm text-[var(--color-muted)]">Google Rating</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-[var(--color-alabaster)] border border-[var(--color-border)]">
                            <div className="text-3xl font-bold text-[var(--color-graphite)] mb-2">{reviewStats.totalReviews}+</div>
                            <p className="text-sm text-[var(--color-muted)]">Happy Residents</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-[var(--color-alabaster)] border border-[var(--color-border)]">
                            <div className="text-3xl font-bold text-[var(--color-graphite)] mb-2">5+</div>
                            <p className="text-sm text-[var(--color-muted)]">Years Experience</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-[var(--color-alabaster)] border border-[var(--color-border)]">
                            <div className="text-3xl font-bold text-[var(--color-graphite)] mb-2">10+</div>
                            <p className="text-sm text-[var(--color-muted)]">Locations</p>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="grid gap-6 md:grid-cols-3 mb-12">
                        <Card className="p-6 bg-[var(--color-alabaster)]/75 border-[var(--color-border)]/70 backdrop-blur-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 p-3 backdrop-blur-md">
                                    <Sparkles className="h-5 w-5 text-[var(--color-clay)]" />
                                </div>
                                <div>
                                    <div className="font-serif text-lg font-semibold text-[var(--color-graphite)]">Designed for comfort</div>
                                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                                        Thoughtful interiors, practical amenities, and a quiet environment—so you can focus on work and life.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-[var(--color-alabaster)]/75 border-[var(--color-border)]/70 backdrop-blur-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 p-3 backdrop-blur-md">
                                    <ShieldCheck className="h-5 w-5 text-[var(--color-clay)]" />
                                </div>
                                <div>
                                    <div className="font-serif text-lg font-semibold text-[var(--color-graphite)]">Safety & standards</div>
                                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                                        Clear rules, responsive support, and high hygiene standards—so your stay feels secure and predictable.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-[var(--color-alabaster)]/75 border-[var(--color-border)]/70 backdrop-blur-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 p-3 backdrop-blur-md">
                                    <Users className="h-5 w-5 text-[var(--color-clay)]" />
                                </div>
                                <div>
                                    <div className="font-serif text-lg font-semibold text-[var(--color-graphite)]">Community-first</div>
                                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                                        A balanced vibe—friendly when you want it, private when you need it.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Operations Proof */}
                    <div className="mb-12">
                        <h2 className="font-serif text-2xl font-semibold text-[var(--color-graphite)] mb-6 text-center">
                            How We Maintain Excellence
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Clock, title: 'Daily Housekeeping', desc: 'Rooms and common areas cleaned every day' },
                                { icon: Utensils, title: 'Hygienic Kitchen', desc: 'FSSAI-compliant food preparation' },
                                { icon: Camera, title: '24/7 CCTV', desc: 'Complete surveillance coverage' },
                                { icon: Building, title: 'Regular Maintenance', desc: 'Issues resolved within 24 hours' },
                            ].map((item) => (
                                <div key={item.title} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-center">
                                    <div className="w-14 h-14 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="h-7 w-7 text-[var(--color-clay)]" />
                                    </div>
                                    <h3 className="font-semibold text-[var(--color-graphite)] mb-1">{item.title}</h3>
                                    <p className="text-sm text-[var(--color-muted)]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Practices */}
                    <div className="mb-12 relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-graphite)] text-white p-8">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <ShieldCheck className="w-12 h-12 text-[var(--color-clay)] mb-4" />
                                <h2 className="font-serif text-2xl font-semibold mb-4">Your Security is Our Priority</h2>
                                <p className="text-gray-300 mb-6">
                                    We take security seriously with multiple layers of protection to ensure your peace of mind.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        '24/7 CCTV surveillance at all entry points',
                                        'Biometric access for residents',
                                        'Security guards on-site round the clock',
                                        'Verified residents only - background checks',
                                        'Emergency contact system',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span className="text-gray-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-white/5">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <ShieldCheck className="w-16 h-16 text-[var(--color-clay)] mx-auto mb-3 opacity-50" />
                                        <p className="text-gray-400 text-sm">Security Infrastructure</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story + What We Focus On */}
                    <div className="grid gap-6 lg:grid-cols-2 mb-12">
                        <Card className="p-8 bg-[var(--color-alabaster)]/75 border-[var(--color-border)]/70 backdrop-blur-md">
                            <div className="font-serif text-2xl font-semibold text-[var(--color-graphite)]">What we focus on</div>
                            <p className="mt-2 text-[var(--color-muted)]">
                                We keep the essentials excellent—so daily life is smooth.
                            </p>
                            <div className="mt-6 grid gap-3">
                                {[
                                    { title: 'Clean rooms & common areas', desc: 'Neat spaces that feel good to come back to.' },
                                    { title: 'Reliable basics', desc: 'Wi‑Fi ready, power backup support, and well‑maintained utilities.' },
                                    { title: 'Support that responds', desc: 'Quick help for day‑to‑day issues and requests.' },
                                    { title: 'Great location choices', desc: 'Popular sectors with metro-friendly connectivity.' },
                                ].map((it) => (
                                    <div key={it.title} className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/70 p-4 backdrop-blur-md">
                                        <div className="font-medium text-[var(--color-graphite)]">{it.title}</div>
                                        <div className="mt-1 text-sm text-[var(--color-muted)]">{it.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-8 bg-[var(--color-alabaster)]/75 border-[var(--color-border)]/70 backdrop-blur-md">
                            <div className="font-serif text-2xl font-semibold text-[var(--color-graphite)]">Our story</div>
                            <p className="mt-2 text-[var(--color-muted)]">
                                SOHO PG started with a simple idea: finding a PG shouldn't be stressful.
                            </p>
                            <div className="mt-6 space-y-4 text-sm text-[var(--color-foreground)]">
                                <p>
                                    We saw people compromise on basics—cleanliness, comfort, and clarity. So we built spaces where the experience is consistent.
                                </p>
                                <p>
                                    From onboarding to daily living, our goal is to make your stay calm, organized, and premium—without the drama.
                                </p>
                                <p>
                                    Today, SOHO PG operates across 10+ locations in Noida, serving hundreds of happy residents who value quality living.
                                </p>
                            </div>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href="/contact">
                                        Talk to Us <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/gallery">See Gallery</Link>
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Policy Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: CheckCircle, label: 'Verified Listings' },
                            { icon: ShieldCheck, label: 'Safe & Secure' },
                            { icon: Award, label: 'Quality Assured' },
                            { icon: Star, label: 'Top Rated' },
                        ].map((badge) => (
                            <div key={badge.label} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/70">
                                <badge.icon className="w-6 h-6 text-[var(--color-clay)]" />
                                <span className="font-medium text-[var(--color-graphite)]">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

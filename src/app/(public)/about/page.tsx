import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Sparkles, Users, ArrowRight } from 'lucide-react'

import prisma from '@/lib/prisma'
import PageRenderer from '@/components/cms/PageRenderer'
import PageHero from '@/components/layout/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
    const page = await prisma.page.findFirst({
        where: { slug: 'about', deletedAt: null, isActive: true, status: 'PUBLISHED' },
        select: { title: true, metaTitle: true, metaDescription: true, ogImageUrl: true },
    })

    if (!page) {
        return {
            title: 'About SOHO PG',
            description: 'Learn about SOHO PG—premium PG living in Noida with a comfort-first, community-first approach.',
        }
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

export default async function AboutPage() {
    const page = await prisma.page.findFirst({
        where: { slug: 'about', deletedAt: null, isActive: true, status: 'PUBLISHED' },
        select: { title: true, content: true },
    })

    if (page) return <PageRenderer title={page.title} content={page.content} />

    // CMS fallback (so About never 404s)
    return (
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
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-3 backdrop-blur-md">
                                <Sparkles className="h-5 w-5 text-(--color-clay)" />
                            </div>
                            <div>
                                <div className="font-serif text-lg font-semibold text-(--color-graphite)">Designed for comfort</div>
                                <p className="mt-1 text-sm text-(--color-muted)">
                                    Thoughtful interiors, practical amenities, and a quiet environment—so you can focus on work and life.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-3 backdrop-blur-md">
                                <ShieldCheck className="h-5 w-5 text-(--color-clay)" />
                            </div>
                            <div>
                                <div className="font-serif text-lg font-semibold text-(--color-graphite)">Safety & standards</div>
                                <p className="mt-1 text-sm text-(--color-muted)">
                                    Clear rules, responsive support, and high hygiene standards—so your stay feels secure and predictable.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-3 backdrop-blur-md">
                                <Users className="h-5 w-5 text-(--color-clay)" />
                            </div>
                            <div>
                                <div className="font-serif text-lg font-semibold text-(--color-graphite)">Community-first</div>
                                <p className="mt-1 text-sm text-(--color-muted)">
                                    A balanced vibe—friendly when you want it, private when you need it.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    <Card className="p-8 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                        <div className="font-serif text-2xl font-semibold text-(--color-graphite)">What we focus on</div>
                        <p className="mt-2 text-(--color-muted)">
                            We keep the essentials excellent—so daily life is smooth.
                        </p>
                        <div className="mt-6 grid gap-3">
                            {[
                                { title: 'Clean rooms & common areas', desc: 'Neat spaces that feel good to come back to.' },
                                { title: 'Reliable basics', desc: 'Wi‑Fi ready, power backup support, and well‑maintained utilities.' },
                                { title: 'Support that responds', desc: 'Quick help for day‑to‑day issues and requests.' },
                                { title: 'Great location choices', desc: 'Popular sectors with metro-friendly connectivity.' },
                            ].map((it) => (
                                <div key={it.title} className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-4 backdrop-blur-md">
                                    <div className="font-medium text-(--color-graphite)">{it.title}</div>
                                    <div className="mt-1 text-sm text-(--color-muted)">{it.desc}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 bg-(--color-alabaster)/75 border-(--color-border)/70 backdrop-blur-md">
                        <div className="font-serif text-2xl font-semibold text-(--color-graphite)">Our story</div>
                        <p className="mt-2 text-(--color-muted)">
                            SOHO PG started with a simple idea: finding a PG shouldn’t be stressful.
                        </p>
                        <div className="mt-6 space-y-4 text-sm text-(--color-foreground)">
                            <p>
                                We saw people compromise on basics—cleanliness, comfort, and clarity. So we built spaces where the experience is consistent.
                            </p>
                            <p>
                                From onboarding to daily living, our goal is to make your stay calm, organized, and premium—without the drama.
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
            </div>
        </div>
    )
}

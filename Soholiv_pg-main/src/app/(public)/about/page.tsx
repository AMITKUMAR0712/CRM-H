import type { Metadata } from 'next'
import Link from 'next/link'
import { 
    ShieldCheck, Sparkles, Users, ArrowRight, Star, 
    Award, CheckCircle, Target, Compass, Heart, 
    Layout, Wifi, Utensils, Zap, Coffee, UserCircle, Building 
} from 'lucide-react'

import prisma from '@/lib/prisma'
import PageRenderer from '@/components/cms/PageRenderer'
import PageHero from '@/components/layout/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
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
            'About Soho Liv - Premium Co-living Excellence',
            '15 Years of Excellence. 500+ Premium Rooms. Soho Liv is the gold standard for budget luxury co-living in Delhi NCR.',
            '/about',
            ['about Soho Liv', 'Jitendra Dixit', 'co-living vision', 'premium PG Noida', 'budget luxury']
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

export default async function AboutPage() {
    let page: { title: string; content: unknown } | null = null

    /* CMS content is disabled temporarily to show the new premium design */
    /*
    try {
        page = await prisma.page.findFirst({
            where: { slug: 'about', deletedAt: null, isActive: true, status: 'PUBLISHED' },
            select: { title: true, content: true },
        })
    } catch (err) {
        console.error('[About] Failed to load CMS content', err)
    }

    if (page) return <PageRenderer title={page.title} content={page.content} />
    */

    const organizationSchema = generateOrganizationSchema()
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
    ])

    const advantages = [
        { icon: Layout, title: "Designer Living", desc: "Fully furnished, modern interiors optimized for comfort." },
        { icon: Wifi, title: "Seamless Connectivity", desc: "Ultra-high-speed Wi-Fi for your work and study marathons." },
        { icon: Utensils, title: "Ghar Jaisa Khana", desc: "Nutritious, home-style meals prepared with highest hygiene standards." },
        { icon: ShieldCheck, title: "Uncompromising Safety", desc: "3-tier security system with 24/7 CCTV and professional guards." },
        { icon: Zap, title: "Total Convenience", desc: "Professional housekeeping and dedicated laundry services." },
        { icon: Coffee, title: "Vibrant Community", desc: "Common \"Chill Zones\" designed for networking and relaxation." },
    ]

    return (
        <div className="min-h-screen">
            <JsonLd data={[organizationSchema, breadcrumbSchema]} />
            
            <PageHero
                kicker="15 Years of Excellence"
                title="Experience Urban Living Reimagined"
                subtitle="500+ Premium Rooms. One Family. The gold standard for Budget Luxury co-living."
                actions={
                    <>
                        <Button asChild size="lg">
                            <Link href="/pg-locations">Find Your Home</Link>
                        </Button>
                        <Button variant="outline" asChild size="lg">
                            <Link href="/contact">Get in Touch</Link>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-20 space-y-24">
                
                {/* Legacy Section */}
                <section className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-(--color-limestone) shadow-2xl">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Building className="w-32 h-32 text-(--color-clay)/20" />
                         </div>
                         <div className="absolute bottom-10 left-10 p-8 glass rounded-2xl border border-white/20">
                            <div className="text-4xl font-bold text-(--color-clay)">15+</div>
                            <div className="text-sm font-medium uppercase tracking-wider">Years of Mastery</div>
                         </div>
                    </div>
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-clay)/10 text-(--color-clay) text-xs font-bold uppercase tracking-widest">
                            Our Story
                        </div>
                        <h2 className="font-serif text-4xl font-bold leading-tight">Our Legacy: A Vision Born in Delhi NCR</h2>
                        <div className="space-y-4 text-(--color-muted) leading-relaxed">
                            <p>
                                Fifteen years ago, <strong>Mr. Jitendra Dixit</strong> recognized a fundamental challenge for the modern Indian migrant: the struggle to find a residence that offered more than just a roof.
                            </p>
                            <p>
                                He envisioned a sanctuary that combined the warmth of home with the efficiency of modern living. What began as a modest 30-room startup has flourished under his visionary leadership into Soho Liv—a premier co-living network managing over 500+ premium units across Delhi NCR.
                            </p>
                            <p>
                                Today, we stand as the gold standard for <strong>&quot;Budget Luxury,&quot;</strong> proving that premium comfort doesn&apos;t have to come with a premium price tag.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision/Mission/Aim */}
                <section className="grid md:grid-cols-3 gap-8">
                    {[
                        { 
                            title: "Our Vision", 
                            icon: Compass, 
                            content: "To be India’s most trusted co-living brand, redefining urban housing as we expand from Delhi NCR to Mumbai, Bangalore, and Kolkata." 
                        },
                        { 
                            title: "Our Mission", 
                            icon: Target, 
                            content: "To bridge the gap between affordability and luxury, creating a \"Rehne Layak Mahaul\" through technology, security, and community." 
                        },
                        { 
                            title: "Our Aim", 
                            icon: Star, 
                            content: "To provide universal accessibility across all major hubs while maintaining uncompromising standards of hygiene and comfort." 
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="relative group p-8 rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
                            <div className="w-12 h-12 rounded-xl bg-(--color-clay)/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="w-6 h-6 text-(--color-clay)" />
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-4">{item.title}</h3>
                            <p className="text-sm text-(--color-muted) leading-relaxed">{item.content}</p>
                        </div>
                    ))}
                </section>

                {/* Advantages */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="font-serif text-4xl font-bold">The Soho Liv Advantage</h2>
                        <p className="text-(--color-muted)">We don&apos;t just offer a place to stay; we curate a lifestyle designed for the ambitious student and the driven professional.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {advantages.map((item, idx) => (
                            <Card key={idx} className="p-6 bg-(--color-surface)/50 border-(--color-border)/70 backdrop-blur-md flex gap-5">
                                <div className="p-3 rounded-xl bg-(--color-surface) border border-(--color-border)/50 text-(--color-clay) h-fit shadow-sm">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-(--color-graphite)">{item.title}</h4>
                                    <p className="text-xs text-(--color-muted) leading-relaxed">{item.desc}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Founder */}
                <section className="relative overflow-hidden rounded-3xl border border-(--color-border)/70 bg-(--color-graphite) text-white p-10 lg:p-16">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-(--color-clay)/10 to-transparent pointer-events-none" />
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                             <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-clay)/20 text-(--color-clay) text-xs font-bold uppercase tracking-widest">
                                    Our Leader
                                </div>
                                <h2 className="font-serif text-4xl font-bold">Meet Our Founder: Mr. Jitendra Dixit</h2>
                                <p className="text-gray-300 leading-relaxed italic text-lg">
                                    &quot;Treat every resident like family&quot;
                                </p>
                             </div>
                             <div className="space-y-4 text-gray-400 leading-relaxed">
                                <p>
                                    With over 15 years of mastery in real estate and hospitality, Mr. Jitendra Dixit remains the heartbeat of Soho Liv. His philosophy is woven into the fabric of our operations.
                                </p>
                                <p>
                                    From his hands-on leadership to his commitment to quality, Mr. Dixit continues to drive Soho Liv toward its goal of becoming a national leader in co-living.
                                </p>
                             </div>
                             <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                                <div className="flex gap-1 text-(--color-clay)">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-sm font-medium tracking-wide">Visionary Excellence</span>
                             </div>
                        </div>
                        <div className="relative aspect-square max-w-md mx-auto lg:ml-auto w-full rounded-2xl overflow-hidden shadow-2xl bg-white/5">
                             <div className="absolute inset-0 flex items-center justify-center">
                                <UserCircle className="w-32 h-32 text-white/5" />
                             </div>
                             {/* Founder Image would go here */}
                             <div className="absolute inset-0 bg-linear-to-t from-(--color-graphite) via-transparent to-transparent opacity-60" />
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="text-center space-y-12">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <Heart className="w-10 h-10 text-(--color-clay) mx-auto mb-4" />
                        <h2 className="font-serif text-4xl font-bold">The Powerhouse Behind the Brand</h2>
                        <p className="text-(--color-muted)">
                            Our success is built on the dedication of our elite team. From our proactive Property Managers to our meticulous Maintenance crews, every member is trained to deliver hospitality that exceeds expectations.
                        </p>
                    </div>
                    <div className="p-10 rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md">
                        <div className="max-w-3xl mx-auto text-lg leading-relaxed text-(--color-graphite)">
                             At Soho Liv, our team is our backbone, ensuring every <strong>&quot;Soho Liv-er&quot;</strong> feels safe, pampered, and truly at home.
                        </div>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                             {[
                                { icon: Award, label: "Trained Staff" },
                                { icon: ShieldCheck, label: "Proactive Support" },
                                { icon: CheckCircle, label: "Quality Service" }
                             ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-(--color-surface) border border-(--color-border)/50 text-sm font-semibold">
                                    <badge.icon className="w-4 h-4 text-(--color-clay)" />
                                    {badge.label}
                                </div>
                             ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center pb-20">
                     <div className="p-12 rounded-3xl bg-(--color-clay) text-white shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <h2 className="font-serif text-3xl font-bold relative z-10">Experience the Soho Liv Advantage Today</h2>
                        <div className="flex flex-wrap justify-center gap-4 relative z-10">
                            <Button size="lg" variant="secondary" asChild className="bg-white text-(--color-clay) hover:bg-gray-100">
                                <Link href="/smart-finder">Find Your PG</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                                <Link href="/contact">Talk to Us</Link>
                            </Button>
                        </div>
                     </div>
                </section>

            </div>
        </div>
    )
}

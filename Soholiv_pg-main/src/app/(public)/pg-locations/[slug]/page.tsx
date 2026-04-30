import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Train, Phone, MessageCircle, ChevronDown, Wifi, Snowflake, Utensils, Car, Dumbbell, Shield, Clock, Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PGCard from '@/components/pg/PGCard'
import FullLeadForm from '@/components/forms/FullLeadForm'
import PageHero from '@/components/layout/PageHero'
import StickyCtaBar from '@/components/layout/StickyCtaBar'
import prisma from '@/lib/prisma'
import { generateLocationMetadata } from '@/lib/seo/metadata'
import { generatePlaceSchema, generateFAQSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import Breadcrumbs from '@/components/seo/Breadcrumbs'

type Props = {
    params: Promise<{ slug: string }>
}

async function getSector(slug: string) {
    try {
        const sector = await prisma.sector.findFirst({
            where: { slug, isActive: true },
            include: {
                pgs: {
                    where: { isActive: true, approvalStatus: 'APPROVED' },
                    include: {
                        photos: { where: { isFeatured: true }, take: 1 },
                        amenities: { include: { amenity: true } },
                    },
                    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
                },
                faqs: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        })

        return sector
    } catch (err) {
        console.error('[Locations] Failed to load sector', err)
        return null
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const sector = await getSector(slug)

    if (!sector) {
        return { title: 'Sector Not Found' }
    }

    return generateLocationMetadata(sector)
}

export async function generateStaticParams() {
    try {
        const sectors = await prisma.sector.findMany({
            where: { isActive: true },
            select: { slug: true },
        })

        return sectors.map((sector) => ({
            slug: sector.slug,
        }))
    } catch (err) {
        console.error('[Locations] Failed to build static params', err)
        return []
    }
}

// Amenity Icon mapping
const amenityIcons: Record<string, typeof Wifi> = {
    wifi: Wifi,
    ac: Snowflake,
    meals: Utensils,
    parking: Car,
    gym: Dumbbell,
    security: Shield,
}

export default async function SectorPage({ params }: Props) {
    const { slug } = await params
    const sector = await getSector(slug)

    if (!sector) {
        notFound()
    }

    const highlights: string[] = Array.isArray(sector.highlights) 
        ? sector.highlights 
        : (sector.highlights as any)?.highlights || []

    // Collect unique amenities from all PGs
    const allAmenities = new Set<string>()
    sector.pgs.forEach(pg => {
        pg.amenities.forEach(a => allAmenities.add(a.amenity.name))
    })

    // Commute information (could be from DB in future)
    const commuteInfo = [
        { icon: Train, label: sector.metroStation || 'Metro Station', distance: sector.metroDistance ? `${sector.metroDistance} km` : 'Nearby' },
        { icon: Building2, label: 'IT Parks & Offices', distance: '2-5 km' },
        { icon: MapPin, label: 'City Centre', distance: '10 km' },
    ]

    // Place Schema
    const placeSchema = generatePlaceSchema(sector)

    // FAQ Schema if FAQs exist
    const faqSchema = sector.faqs.length > 0
        ? generateFAQSchema(sector.faqs.map(faq => ({
            question: faq.question,
            answer: faq.answer,
        })))
        : null

    const breadcrumbItems = [
        { name: 'Locations', url: '/pg-locations' },
        { name: sector.name, url: `/pg-locations/${sector.slug}` },
    ]

    return (
        <>
            <JsonLd data={faqSchema ? [placeSchema, faqSchema] : placeSchema} />
            <div className="pb-20 md:pb-0">
                <PageHero
                    kicker="Location"
                    title={`PG in ${sector.name}, Noida`}
                    subtitle={sector.description || `Find your perfect PG in ${sector.name} with excellent metro connectivity and modern amenities.`}
                    align="left"
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/pg-locations">Back to Locations</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/smart-finder">Use Smart Finder</Link>
                            </Button>
                        </>
                    }
                />

                <div className="container-custom pb-14">
                    {/* Sector Info */}
                    <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-(--color-muted)">
                        {sector.metroStation && (
                            <div className="flex items-center gap-2 rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-4 py-2 backdrop-blur-md">
                                <Train className="h-4 w-4 text-(--color-clay)" />
                                <span>
                                    {sector.metroStation} {sector.metroDistance && `(${sector.metroDistance} km)`}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {highlights.map((highlight) => (
                                <Badge key={highlight} variant="outline">
                                    {highlight}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Amenities Section */}
                            {allAmenities.size > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-lg">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                                    <h2 className="font-serif text-xl font-bold text-(--color-graphite) mb-4">
                                        Amenities Available
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Array.from(allAmenities).map((amenity) => {
                                            const IconComponent = amenityIcons[amenity.toLowerCase()] || Shield
                                            return (
                                                <div
                                                    key={amenity}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border)/50 bg-(--color-surface)/50"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-(--color-clay)/10 flex items-center justify-center">
                                                        <IconComponent className="w-5 h-5 text-(--color-clay)" />
                                                    </div>
                                                    <span className="text-sm font-medium text-(--color-graphite)">{amenity}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Commute Information */}
                            <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-lg">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                                <h2 className="font-serif text-xl font-bold text-(--color-graphite) mb-4">
                                    Commute Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {commuteInfo.map((info, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-(--color-border)/50 bg-(--color-surface)/50"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-(--color-clay)/10 flex items-center justify-center">
                                                <info.icon className="w-6 h-6 text-(--color-clay)" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-(--color-muted)">{info.label}</p>
                                                <p className="font-semibold text-(--color-graphite)">{info.distance}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PG Listings */}
                            <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-lg">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                                <h2 className="font-serif text-2xl font-bold text-(--color-graphite)">
                                    Available PGs in {sector.name}
                                </h2>
                                <p className="mt-2 text-sm text-(--color-muted)">
                                    {sector.pgs.length > 0
                                        ? `${sector.pgs.length} PG${sector.pgs.length > 1 ? 's' : ''} found. Shortlist your options and book a visit anytime.`
                                        : 'No PGs available in this sector yet. Check back soon!'}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {sector.pgs.length > 0 ? (
                                    sector.pgs.map((pg) => (
                                        <PGCard key={pg.id} pg={pg} />
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 p-8 text-center">
                                        <p className="text-(--color-muted)">No PGs available yet.</p>
                                        <Button asChild className="mt-4">
                                            <Link href="/contact">Contact Us for Availability</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* FAQs */}
                            {sector.faqs.length > 0 && (
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-(--color-graphite) mb-6">
                                        FAQs about {sector.name}
                                    </h2>
                                    <div className="space-y-4">
                                        {sector.faqs.map((faq) => (
                                            <details
                                                key={faq.id}
                                                className="group rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 overflow-hidden"
                                            >
                                                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-(--color-graphite) hover:bg-(--color-surface)/50">
                                                    {faq.question}
                                                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                                                </summary>
                                                <div className="px-5 pb-5 text-sm text-(--color-muted)">
                                                    {faq.answer}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Google Maps */}
                            {sector.latitude && sector.longitude && (
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-(--color-graphite) mb-6">
                                        Location
                                    </h2>
                                    <div className="rounded-2xl border border-(--color-border)/70 overflow-hidden h-80">
                                        <iframe
                                            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${sector.longitude}!3d${sector.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${sector.latitude}N+${sector.longitude}E!5e0!3m2!1sen!2sin!4v1629000000000!5m2!1sen!2sin`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={`Map of ${sector.name}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Lead Form */}
                                <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                                    <h3 className="font-serif text-xl font-semibold text-(--color-graphite) mb-4">Enquire Now</h3>
                                    <FullLeadForm sectorSlug={slug} />
                                </div>

                                {/* Quick Contact - Desktop */}
                                <div className="hidden md:block relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-graphite) text-white p-6 shadow-lg">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
                                    <h3 className="font-serif text-lg font-semibold mb-4">Need Help?</h3>
                                    <div className="space-y-3">
                                        <Button variant="secondary" className="w-full bg-white text-(--color-graphite) hover:bg-gray-100" asChild>
                                            <a href="tel:+919871648677" className="flex items-center justify-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Call Now
                                            </a>
                                        </Button>
                                        <Button variant="secondary" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                                            <a
                                                href="https://wa.me/919871648677"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                WhatsApp
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky CTA for Mobile */}
                <StickyCtaBar />
            </div>
        </>
    )
}

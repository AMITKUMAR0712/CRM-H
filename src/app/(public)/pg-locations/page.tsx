import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Train, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/layout/PageHero'
import prisma from '@/lib/prisma'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateCollectionPageSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { getSectorSeoSlug } from '@/lib/seo/slugs'

export const metadata: Metadata = generatePageMetadata(
    'Best PG Locations in Noida & Greater Noida | Sector 168, 22, 51',
    'Compare Soho Liv PG locations in Noida Sector 168, Sector 22 and Sector 51. Find affordable PG rooms with AC, food, WiFi, security, direct chat and CRM ticket support.',
    '/pg-locations',
    ['PG locations Noida', 'best PG sectors Noida', 'Sector 168 Noida PG', 'Sector 22 Noida PG', 'Sector 51 Noida PG', 'Greater Noida PG locations']
)

async function getSectors() {
    try {
        const sectors = await prisma.sector.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        pgs: { where: { isActive: true, approvalStatus: 'APPROVED' } },
                    },
                },
            },
            orderBy: { name: 'asc' },
        })

        // Get price ranges for each sector
        const sectorsWithStats = await Promise.all(
            sectors.map(async (sector) => {
                const priceRange = await prisma.pG.aggregate({
                    where: { sectorId: sector.id, isActive: true, approvalStatus: 'APPROVED' },
                    _min: { monthlyRent: true },
                    _max: { monthlyRent: true },
                })

                return {
                    ...sector,
                    pgCount: sector._count.pgs,
                    priceRange: {
                        min: priceRange._min.monthlyRent,
                        max: priceRange._max.monthlyRent,
                    },
                }
            })
        )

        return sectorsWithStats
    } catch (err) {
        console.error('[Locations] Failed to load sectors', err)
        return []
    }
}

function formatPriceRange(min: number | null, max: number | null) {
    if (!min && !max) return 'Contact for pricing'
    if (min === max) return `₹${min?.toLocaleString('en-IN')}`
    return `₹${min?.toLocaleString('en-IN') || '5,000'} - ₹${max?.toLocaleString('en-IN') || '15,000'}`
}

export default async function LocationsPage() {
    const sectors = await getSectors()

    // Collection Page Schema
    const collectionSchema = generateCollectionPageSchema(
        'Best PG Locations in Noida and Greater Noida',
        'Browse Soho Liv PG accommodation across Noida Sector 168, Sector 22 and Sector 51 with affordable rooms, meals, WiFi and resident support.',
        '/pg-locations',
        sectors.length
    )

    return (
        <>
            <JsonLd data={collectionSchema} />
            <div>
                <PageHero
                    kicker="Locations"
                    title="Best PG Locations in Noida"
                    subtitle="Choose Soho Liv PGs in Sector 168, Sector 22 and Sector 51 Noida. Compare affordable rent, metro access, food, WiFi, security and fast CRM-backed support."
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
                    {/* Sectors Grid */}
                    {sectors.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sectors.map((sector) => (
                                <Link
                                    key={sector.slug}
                                    href={`/pg-locations/${getSectorSeoSlug(sector.slug)}`}
                                    className="group relative block overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(0,0,0,0.14)]"
                                >
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/30 to-transparent" />

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-(--color-clay)">
                                            <MapPin className="h-5 w-5" />
                                            <h2 className="font-serif text-xl font-semibold text-(--color-graphite)">{sector.name}</h2>
                                        </div>
                                        <div className="inline-flex items-center gap-1 rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-3 py-1 text-xs font-semibold text-(--color-graphite) backdrop-blur-md">
                                            <Building2 className="h-4 w-4 text-(--color-clay)" />
                                            {sector.pgCount} PGs
                                        </div>
                                    </div>

                                    <p className="mt-3 line-clamp-2 text-sm text-(--color-muted)">
                                        {sector.description || `Affordable PG accommodation in ${sector.name}, Noida with AC rooms, food, WiFi, security and resident ticket support.`}
                                    </p>

                                    {sector.metroStation && (
                                        <div className="mt-4 flex items-center gap-2 text-sm text-(--color-muted)">
                                            <Train className="h-4 w-4" />
                                            <span>{sector.metroStation}</span>
                                            {sector.metroDistance && (
                                                <span className="font-medium text-(--color-clay)">({sector.metroDistance} km)</span>
                                            )}
                                        </div>
                                    )}

                                    {sector.highlights && Array.isArray(sector.highlights) && sector.highlights.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(sector.highlights as string[]).slice(0, 3).map((highlight) => (
                                                <span
                                                    key={highlight}
                                                    className="rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-3 py-1 text-xs font-medium text-(--color-graphite) backdrop-blur-md"
                                                >
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 px-4 py-3 backdrop-blur-md">
                                        <div>
                                            <p className="text-xs text-(--color-muted)">Typical range</p>
                                            <p className="font-semibold text-(--color-graphite)">
                                                {formatPriceRange(sector.priceRange.min, sector.priceRange.max)}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-(--color-clay) font-medium text-sm">
                                            View PGs
                                            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-(--color-muted)">No sectors available yet. Check back soon!</p>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-(--color-muted)">Can&apos;t decide? We&apos;ll help you shortlist the best PG in Noida in minutes.</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            <Button asChild>
                                <Link href="/smart-finder">Shortlist Now</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/contact">Talk to Support</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

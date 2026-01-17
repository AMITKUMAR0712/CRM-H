import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Train, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/layout/PageHero'

export const metadata: Metadata = {
    title: 'PG Locations in Noida',
    description: 'Find PG accommodation in popular Noida sectors - 50, 51, 52, 62, 76. Near metro stations with great connectivity.',
}

const sectors = [
    {
        name: 'Sector 51',
        slug: 'sector-51',
        description: 'Premium tech hub location near Noida City Centre. Home to major IT companies with excellent metro connectivity.',
        metro: 'Sector 51 Metro',
        distance: '0.5 km',
        priceRange: '₹8,000 - ₹15,000',
        available: 5,
        highlights: ['Near IT Companies', 'Metro Access', 'Markets Nearby'],
    },
    {
        name: 'Sector 62',
        slug: 'sector-62',
        description: 'Major corporate hub with excellent connectivity. Perfect for professionals working in the area.',
        metro: 'Sector 62 Metro',
        distance: '0.8 km',
        priceRange: '₹7,000 - ₹12,000',
        available: 8,
        highlights: ['Corporate Hub', 'Good Transport', 'Restaurants'],
    },
    {
        name: 'Sector 50',
        slug: 'sector-50',
        description: 'Peaceful residential area with good amenities. Ideal for those seeking a quiet living environment.',
        metro: 'Sector 50 Metro',
        distance: '1.2 km',
        priceRange: '₹6,000 - ₹10,000',
        available: 3,
        highlights: ['Quiet Area', 'Parks', 'Family-friendly'],
    },
    {
        name: 'Sector 52',
        slug: 'sector-52',
        description: 'Well-connected residential sector with mix of commercial and residential spaces.',
        metro: 'Sector 52 Metro',
        distance: '1.0 km',
        priceRange: '₹6,500 - ₹11,000',
        available: 4,
        highlights: ['Shopping Malls', 'Hospitals', 'Schools'],
    },
    {
        name: 'Sector 76',
        slug: 'sector-76',
        description: 'Developing area with affordable options and growing infrastructure.',
        metro: 'Sector 76 Metro',
        distance: '0.6 km',
        priceRange: '₹5,000 - ₹9,000',
        available: 6,
        highlights: ['Affordable', 'New Buildings', 'Metro Nearby'],
    },
]

export default function LocationsPage() {
    return (
        <div>
            <PageHero
                kicker="Locations"
                title="PG Locations in Noida"
                subtitle="Choose your preferred sector. Explore metro-friendly areas and compare options in seconds."
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sectors.map((sector) => (
                        <Link
                            key={sector.slug}
                            href={`/pg-locations/${sector.slug}`}
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
                                    {sector.available} PGs
                                </div>
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm text-(--color-muted)">{sector.description}</p>

                            <div className="mt-4 flex items-center gap-2 text-sm text-(--color-muted)">
                                <Train className="h-4 w-4" />
                                <span>{sector.metro}</span>
                                <span className="font-medium text-(--color-clay)">({sector.distance})</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {sector.highlights.map((highlight) => (
                                    <span
                                        key={highlight}
                                        className="rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-3 py-1 text-xs font-medium text-(--color-graphite) backdrop-blur-md"
                                    >
                                        {highlight}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-2xl border border-(--color-border)/70 bg-(--color-surface)/70 px-4 py-3 backdrop-blur-md">
                                <div>
                                    <p className="text-xs text-(--color-muted)">Typical range</p>
                                    <p className="font-semibold text-(--color-graphite)">{sector.priceRange}</p>
                                </div>
                                <div className="flex items-center text-(--color-clay) font-medium text-sm">
                                    View PGs
                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <p className="text-(--color-muted)">Can&apos;t decide? We&apos;ll help you shortlist in minutes.</p>
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
    )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Train, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <div className="section-padding">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        PG Locations in Noida
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg max-w-2xl mx-auto">
                        Choose your preferred sector. All our PGs are within walking distance from metro stations.
                    </p>
                </div>

                {/* Sectors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectors.map((sector) => (
                        <Link
                            key={sector.slug}
                            href={`/pg-locations/${sector.slug}`}
                            className="group block p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 text-[var(--color-clay)] mb-3">
                                <MapPin className="w-5 h-5" />
                                <h2 className="font-serif text-xl font-semibold">{sector.name}</h2>
                            </div>

                            <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-2">
                                {sector.description}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-4">
                                <Train className="w-4 h-4" />
                                <span>{sector.metro}</span>
                                <span className="text-[var(--color-clay)] font-medium">({sector.distance})</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {sector.highlights.map((highlight) => (
                                    <span
                                        key={highlight}
                                        className="px-2 py-1 text-xs rounded-full bg-[var(--color-limestone)] text-[var(--color-graphite)]"
                                    >
                                        {highlight}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                <div>
                                    <p className="text-xs text-[var(--color-muted)]">Starting from</p>
                                    <p className="font-semibold text-[var(--color-graphite)]">{sector.priceRange}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[var(--color-clay)]">
                                    <Building2 className="w-4 h-4" />
                                    <span className="font-semibold">{sector.available} PGs</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center text-[var(--color-clay)] font-medium text-sm">
                                View PGs
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-[var(--color-muted)] mb-4">Can't decide? Let us help you find the perfect PG.</p>
                    <Button asChild>
                        <Link href="/smart-finder">Use Smart Finder</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Train, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PGCard from '@/components/pg/PGCard'
import LeadForm from '@/components/forms/LeadForm'
import PageHero from '@/components/layout/PageHero'

// Static sector data (would come from API in production)
const sectorsData: Record<string, {
    name: string
    description: string
    metro: string
    distance: string
    latitude: number
    longitude: number
    highlights: string[]
}> = {
    'sector-51': {
        name: 'Sector 51',
        description: 'Sector 51 is a premium tech hub location in Noida, home to major IT companies. It offers excellent metro connectivity via Sector 51 Metro Station and has a vibrant commercial area with restaurants, cafes, and shopping options.',
        metro: 'Sector 51 Metro',
        distance: '0.5 km',
        latitude: 28.4303,
        longitude: 77.3784,
        highlights: ['Near IT Companies', 'Metro Access', 'Markets Nearby', 'Good Food Options'],
    },
    'sector-62': {
        name: 'Sector 62',
        description: 'Sector 62 is a major corporate hub in Noida with excellent connectivity. Many multinational companies have offices here, making it ideal for working professionals.',
        metro: 'Sector 62 Metro',
        distance: '0.8 km',
        latitude: 28.6279,
        longitude: 77.3649,
        highlights: ['Corporate Hub', 'Good Transport', 'Restaurants', 'Shopping Malls'],
    },
    'sector-50': {
        name: 'Sector 50',
        description: 'Sector 50 is a peaceful residential area with good amenities and parks. Ideal for those seeking a quiet living environment away from the hustle.',
        metro: 'Sector 50 Metro',
        distance: '1.2 km',
        latitude: 28.4285,
        longitude: 77.3721,
        highlights: ['Quiet Area', 'Parks', 'Family-friendly', 'Schools Nearby'],
    },
}

// Sample PG data
const samplePGs = [
    {
        id: '1',
        name: 'SOHO Premium',
        slug: 'soho-premium-51',
        monthlyRent: 12000,
        roomType: 'SINGLE',
        occupancyType: 'BOYS',
        hasAC: true,
        hasWifi: true,
        mealsIncluded: true,
        isFeatured: true,
        availableRooms: 3,
    },
    {
        id: '2',
        name: 'SOHO Comfort',
        slug: 'soho-comfort-51',
        monthlyRent: 8000,
        roomType: 'DOUBLE',
        occupancyType: 'CO_LIVING',
        hasAC: true,
        hasWifi: true,
        mealsIncluded: true,
        isFeatured: false,
        availableRooms: 5,
    },
]

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const sector = sectorsData[slug]

    if (!sector) {
        return { title: 'Sector Not Found' }
    }

    return {
        title: `PG in Noida ${sector.name} | Best Paying Guest`,
        description: sector.description,
    }
}

export default async function SectorPage({ params }: Props) {
    const { slug } = await params
    const sector = sectorsData[slug]

    if (!sector) {
        notFound()
    }

    return (
        <div>
            <PageHero
                kicker="Location"
                title={`PG in ${sector.name}, Noida`}
                subtitle={sector.description}
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
                <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-(--color-muted)">
                    <div className="flex items-center gap-2 rounded-full border border-(--color-border)/70 bg-(--color-surface)/70 px-4 py-2 backdrop-blur-md">
                        <Train className="h-4 w-4 text-(--color-clay)" />
                        <span>
                            {sector.metro} ({sector.distance})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sector.highlights.map((highlight) => (
                            <Badge key={highlight} variant="outline">
                                {highlight}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* PG Listings */}
                    <div className="lg:col-span-2">
                        <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.10)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                            <h2 className="font-serif text-2xl font-bold text-(--color-graphite)">
                                Available PGs in {sector.name}
                            </h2>
                            <p className="mt-2 text-sm text-(--color-muted)">Shortlist your options and book a visit anytime.</p>
                        </div>

                        <div className="mt-6 space-y-6">
                            {samplePGs.map((pg) => (
                                <PGCard key={pg.id} pg={pg} />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Lead Form */}
                            <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/24 to-transparent" />
                                <h3 className="font-serif text-xl font-semibold text-(--color-graphite) mb-4">Enquire Now</h3>
                                <LeadForm sectorSlug={slug} />
                            </div>

                            {/* Quick Contact */}
                            <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-graphite) text-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
                                <h3 className="font-serif text-lg font-semibold mb-4">Need Help?</h3>
                                <div className="space-y-3">
                                    <Button variant="white" className="w-full" asChild>
                                        <a href="tel:+919876543210" className="flex items-center justify-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Call Now
                                        </a>
                                    </Button>
                                    <Button variant="secondary" className="w-full bg-green-600 hover:bg-green-700" asChild>
                                        <a
                                            href="https://wa.me/919876543210"
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
        </div>
    )
}

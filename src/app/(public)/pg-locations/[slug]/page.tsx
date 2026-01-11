import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Train, Phone, MessageCircle, Wifi, Snowflake, Utensils, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PGCard from '@/components/pg/PGCard'
import LeadForm from '@/components/forms/LeadForm'

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
            {/* Hero */}
            <section className="bg-[var(--color-limestone)] py-12">
                <div className="container-custom">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-4">
                        <Link href="/pg-locations" className="hover:text-[var(--color-clay)]">Locations</Link>
                        <span>/</span>
                        <span>{sector.name}</span>
                    </div>

                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        PG in {sector.name}, Noida
                    </h1>

                    <div className="flex items-center gap-4 text-[var(--color-muted)] mb-6">
                        <div className="flex items-center gap-2">
                            <Train className="w-5 h-5 text-[var(--color-clay)]" />
                            <span>{sector.metro} ({sector.distance})</span>
                        </div>
                    </div>

                    <p className="text-[var(--color-muted)] max-w-3xl mb-6">
                        {sector.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {sector.highlights.map((highlight) => (
                            <Badge key={highlight} variant="outline">{highlight}</Badge>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* PG Listings */}
                        <div className="lg:col-span-2">
                            <h2 className="font-serif text-2xl font-bold text-[var(--color-graphite)] mb-6">
                                Available PGs in {sector.name}
                            </h2>

                            <div className="space-y-6">
                                {samplePGs.map((pg) => (
                                    <PGCard key={pg.id} pg={pg} />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                {/* Lead Form */}
                                <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 mb-6">
                                    <h3 className="font-serif text-xl font-semibold mb-4">Enquire Now</h3>
                                    <LeadForm sectorSlug={slug} />
                                </div>

                                {/* Quick Contact */}
                                <div className="bg-[var(--color-graphite)] text-white rounded-2xl p-6">
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
            </section>
        </div>
    )
}

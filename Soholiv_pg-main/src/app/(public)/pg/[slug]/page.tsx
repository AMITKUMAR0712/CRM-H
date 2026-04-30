import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    MapPin, Phone, MessageCircle, ArrowLeft, Users, Snowflake, Wifi, Utensils, Car, Dumbbell,
    Shield, Clock, Zap, Tv, ChevronRight, Star, Home, BedDouble, Calendar, IndianRupee,
    CheckCircle, Building2, Train
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FullLeadForm from '@/components/forms/FullLeadForm'
import PageHero from '@/components/layout/PageHero'
import StickyCtaBar from '@/components/layout/StickyCtaBar'
import PGPhotoGallery from '@/components/pg/PGPhotoGallery'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { generatePGMetadata } from '@/lib/seo/metadata'
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

type Props = {
    params: Promise<{ slug: string }>
}

async function getPG(slug: string) {
    try {
        const pg = await prisma.pG.findFirst({
            where: { slug, isActive: true, approvalStatus: 'APPROVED' },
            include: {
                sector: true,
                photos: {
                    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
                },
                amenities: {
                    include: { amenity: true },
                },
                reviews: {
                    where: { isApproved: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
        })

        return pg
    } catch (err) {
        console.error('[PG] Failed to load PG', err)
        return null
    }
}

async function getRelatedPGs(sectorId: string, currentSlug: string) {
    try {
        const pgs = await prisma.pG.findMany({
            where: {
                sectorId,
                isActive: true,
                approvalStatus: 'APPROVED',
                slug: { not: currentSlug },
            },
            include: {
                photos: { where: { isFeatured: true }, take: 1 },
                sector: { select: { name: true, slug: true } },
            },
            take: 3,
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        })

        return pgs
    } catch (err) {
        console.error('[PG] Failed to load related PGs', err)
        return []
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const pg = await getPG(slug)
    if (!pg) return { title: 'PG Not Found' }

    return generatePGMetadata({
        ...pg,
        photos: pg.photos || []
    } as any)
}

export async function generateStaticParams() {
    try {
        const pgs = await prisma.pG.findMany({
            where: { isActive: true, approvalStatus: 'APPROVED' },
            select: { slug: true },
        })

        return pgs.map((pg) => ({ slug: pg.slug }))
    } catch (err) {
        console.error('[PG] Failed to build static params', err)
        return []
    }
}

const roomTypeLabels: Record<string, string> = {
    SINGLE: 'Single Room',
    DOUBLE: 'Double Sharing',
    TRIPLE: 'Triple Sharing',
    FOUR_SHARING: '4-Sharing',
}

const occupancyLabels: Record<string, string> = {
    BOYS: 'Boys Only',
    GIRLS: 'Girls Only',
    CO_LIVING: 'Co-Living',
}

// Amenity icon mapping
const amenityIconMap: Record<string, typeof Wifi> = {
    wifi: Wifi,
    ac: Snowflake,
    meals: Utensils,
    parking: Car,
    gym: Dumbbell,
    security: Shield,
    power: Zap,
    laundry: Clock,
    tv: Tv,
}

export default async function PGDetailPage({ params }: Props) {
    const { slug } = await params
    const pg = await getPG(slug)

    if (!pg) {
        notFound()
    }

    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
        try {
            await prisma.pG.update({
                where: { id: pg.id },
                data: { viewCount: { increment: 1 } },
            })
        } catch (err) {
            console.error('[PG] Failed to increment view count', err)
        }
    }

    const relatedPGs = await getRelatedPGs(pg.sectorId, slug)

    // Calculate average rating
    const avgRating = pg.reviews.length > 0
        ? Math.round((pg.reviews.reduce((sum, r) => sum + r.rating, 0) / pg.reviews.length) * 10) / 10
        : null

    // Build amenities list from both flags and relations
    const amenitiesList: { name: string; icon: typeof Wifi }[] = []
    if (pg.hasAC) amenitiesList.push({ name: 'Air Conditioning', icon: Snowflake })
    if (pg.hasWifi) amenitiesList.push({ name: 'High-Speed WiFi', icon: Wifi })
    if (pg.mealsIncluded) amenitiesList.push({ name: `Meals (${pg.mealsPerDay || 2}x/day)`, icon: Utensils })
    if (pg.hasParking) amenitiesList.push({ name: 'Parking', icon: Car })
    if (pg.hasGym) amenitiesList.push({ name: 'Gym Access', icon: Dumbbell })
    if (pg.hasPowerBackup) amenitiesList.push({ name: 'Power Backup', icon: Zap })
    if (pg.hasLaundry) amenitiesList.push({ name: 'Laundry Service', icon: Clock })
    if (pg.hasTV) amenitiesList.push({ name: 'TV in Room', icon: Tv })

    // Add amenities from relations
    pg.amenities.forEach(({ amenity }) => {
        const iconKey = amenity.icon?.toLowerCase() || amenity.slug
        const IconComponent = amenityIconMap[iconKey] || Shield
        if (!amenitiesList.find(a => a.name.toLowerCase().includes(amenity.name.toLowerCase()))) {
            amenitiesList.push({ name: amenity.name, icon: IconComponent })
        }
    })

    // Structured Data
    const productSchema = generateProductSchema({
        ...pg,
        reviews: pg.reviews.map(r => ({ rating: r.rating }))
    } as any)

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Locations', url: '/pg-locations' },
        { name: pg.sector.name, url: `/pg-locations/${pg.sector.slug}` },
        { name: pg.name, url: `/pg/${pg.slug}` }
    ])

    return (
        <>
            <JsonLd data={[productSchema, breadcrumbSchema]} />

            <div className="pb-20 md:pb-0">
                <PageHero
                    kicker={pg.sector.name}
                    title={pg.name}
                    subtitle={`${roomTypeLabels[pg.roomType]} • ${occupancyLabels[pg.occupancyType]} • ${pg.hasAC ? 'AC' : 'Non-AC'}`}
                    align="left"
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={`/pg-locations/${pg.sector.slug}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to {pg.sector.name}
                                </Link>
                            </Button>
                            <Button asChild>
                                <a href={`https://wa.me/919871648677?text=${encodeURIComponent(`Hi! I'm interested in ${pg.name} in ${pg.sector.name}. Please share more details.`)}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </a>
                            </Button>
                        </>
                    }
                />

                <div className="container-custom pb-14">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                        <Link href="/" className="hover:text-[var(--color-clay)]">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/pg-locations" className="hover:text-[var(--color-clay)]">Locations</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={`/pg-locations/${pg.sector.slug}`} className="hover:text-[var(--color-clay)]">{pg.sector.name}</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-[var(--color-graphite)]">{pg.name}</span>
                    </nav>

                    {/* Quick Badges */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {pg.isFeatured && <Badge className="bg-amber-500">Featured</Badge>}
                        {pg.availableRooms > 0 ? (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {pg.availableRooms} Rooms Available
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-red-500 text-red-600">Fully Booked</Badge>
                        )}
                        {avgRating && (
                            <Badge variant="outline">
                                <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                                {avgRating} ({pg.reviews.length} reviews)
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Photo Gallery */}
                            <PGPhotoGallery photos={pg.photos} pgName={pg.name} />

                            {/* Price Card - Mobile Only */}
                            <div className="lg:hidden relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-clay)] text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-sm">Monthly Rent</p>
                                        <p className="text-3xl font-bold">{formatPrice(pg.monthlyRent)}</p>
                                    </div>
                                    <Button variant="secondary" className="bg-white text-[var(--color-graphite)] hover:bg-gray-100" asChild>
                                        <a href="tel:+919871648677">
                                            <Phone className="mr-2 h-4 w-4" />
                                            Call Now
                                        </a>
                                    </Button>
                                </div>
                                {pg.securityDeposit && (
                                    <p className="mt-2 text-white/80 text-sm">Security Deposit: {formatPrice(pg.securityDeposit)}</p>
                                )}
                            </div>

                            {/* Quick Info */}
                            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">Quick Overview</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-clay)]/10 flex items-center justify-center">
                                            <BedDouble className="w-5 h-5 text-[var(--color-clay)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">Room Type</p>
                                            <p className="font-semibold text-[var(--color-graphite)]">{roomTypeLabels[pg.roomType]}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-clay)]/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-[var(--color-clay)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">For</p>
                                            <p className="font-semibold text-[var(--color-graphite)]">{occupancyLabels[pg.occupancyType]}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-clay)]/10 flex items-center justify-center">
                                            <Home className="w-5 h-5 text-[var(--color-clay)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">Available</p>
                                            <p className="font-semibold text-[var(--color-graphite)]">{pg.availableRooms} Rooms</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-clay)]/10 flex items-center justify-center">
                                            <IndianRupee className="w-5 h-5 text-[var(--color-clay)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">Deposit</p>
                                            <p className="font-semibold text-[var(--color-graphite)]">{pg.securityDeposit ? formatPrice(pg.securityDeposit) : 'Ask'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {pg.description && (
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                    <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">About This PG</h2>
                                    <div className="prose prose-sm max-w-none text-[var(--color-foreground)]">
                                        <p>{pg.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Amenities */}
                            {amenitiesList.length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                    <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">Amenities & Facilities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {amenitiesList.map((amenity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-clay)]/10 flex items-center justify-center">
                                                    <amenity.icon className="w-5 h-5 text-[var(--color-clay)]" />
                                                </div>
                                                <span className="text-sm font-medium text-[var(--color-graphite)]">{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* House Rules */}
                            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">House Rules & Policies</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pg.gateClosingTime && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                            <Clock className="w-5 h-5 text-[var(--color-clay)]" />
                                            <div>
                                                <p className="text-xs text-[var(--color-muted)]">Gate Closing Time</p>
                                                <p className="font-medium text-[var(--color-graphite)]">{pg.gateClosingTime}</p>
                                            </div>
                                        </div>
                                    )}
                                    {pg.noticePeriod && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                            <Calendar className="w-5 h-5 text-[var(--color-clay)]" />
                                            <div>
                                                <p className="text-xs text-[var(--color-muted)]">Notice Period</p>
                                                <p className="font-medium text-[var(--color-graphite)]">{pg.noticePeriod} days</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <Shield className="w-5 h-5 text-[var(--color-clay)]" />
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">Visitors</p>
                                            <p className="font-medium text-[var(--color-graphite)]">Allowed in common areas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                        <CheckCircle className="w-5 h-5 text-[var(--color-clay)]" />
                                        <div>
                                            <p className="text-xs text-[var(--color-muted)]">ID Verification</p>
                                            <p className="font-medium text-[var(--color-graphite)]">Required at check-in</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">Location</h2>

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                                        <MapPin className="w-5 h-5 text-[var(--color-clay)]" />
                                        <span>{pg.address}</span>
                                    </div>
                                    {pg.sector.metroStation && (
                                        <div className="flex items-center gap-2 text-[var(--color-muted)]">
                                            <Train className="w-5 h-5 text-[var(--color-clay)]" />
                                            <span>{pg.sector.metroStation} {pg.sector.metroDistance && `(${pg.sector.metroDistance} km)`}</span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/pg-locations/${pg.sector.slug}`}
                                    className="inline-flex items-center gap-2 text-[var(--color-clay)] font-medium hover:underline mb-4"
                                >
                                    <Building2 className="w-4 h-4" />
                                    View all PGs in {pg.sector.name}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>

                                {(pg.latitude && pg.longitude) && (
                                    <div className="rounded-xl border border-[var(--color-border)]/70 overflow-hidden h-64">
                                        <iframe
                                            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${pg.longitude}!3d${pg.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${pg.latitude}N+${pg.longitude}E!5e0!3m2!1sen!2sin!4v1629000000000!5m2!1sen!2sin`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={`Map of ${pg.name}`}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            {pg.reviews.length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-lg">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)]">Reviews</h2>
                                        {avgRating && (
                                            <div className="flex items-center gap-2">
                                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                                <span className="font-bold text-[var(--color-graphite)]">{avgRating}</span>
                                                <span className="text-[var(--color-muted)]">({pg.reviews.length} reviews)</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {pg.reviews.map((review) => (
                                            <div key={review.id} className="p-4 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-[var(--color-graphite)]">{review.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-[var(--color-muted)]">{review.comment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related PGs */}
                            {relatedPGs.length > 0 && (
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-[var(--color-graphite)] mb-4">More PGs in {pg.sector.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedPGs.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/pg/${related.slug}`}
                                                className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg"
                                            >
                                                <div className="relative aspect-video bg-[var(--color-limestone)]">
                                                    {related.photos[0] ? (
                                                        <Image
                                                            src={related.photos[0].url}
                                                            alt={related.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 100vw, 240px"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">Photo</div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-[var(--color-graphite)] group-hover:text-[var(--color-clay)] transition-colors">
                                                        {related.name}
                                                    </h3>
                                                    <p className="text-lg font-bold text-[var(--color-clay)]">{formatPrice(related.monthlyRent)}/mo</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Price Card - Desktop */}
                                <div className="hidden lg:block relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-clay)] text-white p-6">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
                                    <p className="text-white/80 text-sm mb-1">Monthly Rent</p>
                                    <p className="text-4xl font-bold mb-2">{formatPrice(pg.monthlyRent)}</p>
                                    {pg.securityDeposit && (
                                        <p className="text-white/80 text-sm">Security: {formatPrice(pg.securityDeposit)}</p>
                                    )}
                                    <div className="mt-4 space-y-3">
                                        <Button variant="secondary" className="w-full bg-white text-[var(--color-graphite)] hover:bg-gray-100" asChild>
                                            <a href="tel:+919871648677">
                                                <Phone className="mr-2 h-4 w-4" />
                                                Call Now
                                            </a>
                                        </Button>
                                        <Button variant="secondary" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                                            <a
                                                href={`https://wa.me/919871648677?text=${encodeURIComponent(`Hi! I'm interested in ${pg.name} in ${pg.sector.name}. Please share more details.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                WhatsApp
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Enquiry Form */}
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-alabaster)]/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-clay)]/24 to-transparent" />
                                    <h3 className="font-serif text-xl font-semibold text-[var(--color-graphite)] mb-4">Enquire About This PG</h3>
                                    <FullLeadForm pgSlug={pg.slug} sectorSlug={pg.sector.slug} />
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

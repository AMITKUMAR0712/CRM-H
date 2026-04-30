'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Wifi, Snowflake, Utensils, ArrowRight, Users, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface PGCardProps {
    pg: {
        id: string
        name: string
        slug: string
        monthlyRent: number
        roomType: string
        occupancyType: string
        hasAC: boolean
        hasWifi: boolean
        mealsIncluded: boolean
        isFeatured: boolean
        availableRooms: number
        photos?: {
            id: string
            url: string
            altText?: string | null
            isFeatured: boolean
        }[]
        sector?: {
            name: string
            slug: string
        }
    }
}

const roomTypeLabels: Record<string, string> = {
    SINGLE: 'Single',
    DOUBLE: 'Double',
    TRIPLE: 'Triple',
    FOUR_SHARING: '4-Sharing',
}

const occupancyLabels: Record<string, string> = {
    BOYS: 'Boys Only',
    GIRLS: 'Girls Only',
    CO_LIVING: 'Co-Living',
}

export default function PGCard({ pg }: PGCardProps) {
    const featuredPhoto = pg.photos?.find(p => p.isFeatured) || pg.photos?.[0]

    return (
        <div className="bg-(--color-surface) rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all duration-300 group">
            <Link href={`/pg/${pg.slug}`} className="block">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-40 bg-[var(--color-limestone)] rounded-xl overflow-hidden flex items-center justify-center">
                        {featuredPhoto ? (
                            <Image
                                src={featuredPhoto.url}
                                alt={featuredPhoto.altText || pg.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 192px"
                            />
                        ) : (
                            <span className="text-[var(--color-muted)]">Photo</span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-serif text-xl font-semibold text-[var(--color-graphite)] group-hover:text-[var(--color-clay)] transition-colors">
                                        {pg.name}
                                    </h3>
                                    {pg.isFeatured && <Badge>Featured</Badge>}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                                    <span>{roomTypeLabels[pg.roomType] || pg.roomType}</span>
                                    <span>•</span>
                                    <span>{occupancyLabels[pg.occupancyType] || pg.occupancyType}</span>
                                    {pg.sector && (
                                        <>
                                            <span>•</span>
                                            <span>{pg.sector.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[var(--color-clay)]">
                                    {formatPrice(pg.monthlyRent)}
                                </p>
                                <p className="text-xs text-[var(--color-muted)]">/month</p>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-3 my-4">
                            {pg.hasAC && (
                                <div className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                                    <Snowflake className="w-4 h-4 text-blue-500" />
                                    AC
                                </div>
                            )}
                            {pg.hasWifi && (
                                <div className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                                    <Wifi className="w-4 h-4 text-green-500" />
                                    WiFi
                                </div>
                            )}
                            {pg.mealsIncluded && (
                                <div className="flex items-center gap-1 text-sm text-[var(--color-muted)]">
                                    <Utensils className="w-4 h-4 text-orange-500" />
                                    Meals
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center gap-1 text-sm">
                                <Users className="w-4 h-4 text-[var(--color-clay)]" />
                                <span className="text-[var(--color-clay)] font-medium">{pg.availableRooms} rooms</span>
                                <span className="text-[var(--color-muted)]">available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-clay)]">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Quick Action Buttons - Outside the link to prevent nested links */}
            <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border)]/50">
                <Button size="sm" variant="outline" asChild>
                    <a href={`tel:+919871648677`} onClick={(e) => e.stopPropagation()}>
                        Call Now
                    </a>
                </Button>
                <Button size="sm" asChild>
                    <a
                        href={`https://wa.me/919871648677?text=${encodeURIComponent(`Hi! I'm interested in ${pg.name}. Please share more details.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        WhatsApp
                    </a>
                </Button>
            </div>
        </div>
    )
}

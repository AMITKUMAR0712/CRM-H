'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Train, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectors } from '@/lib/hooks'

function formatPriceRange(min: number | null, max: number | null) {
    if (!min && !max) return 'Contact for pricing'
    if (min === max) return `₹${min?.toLocaleString('en-IN')}`
    return `₹${min?.toLocaleString('en-IN') || '5,000'} - ₹${max?.toLocaleString('en-IN') || '15,000'}`
}

export default function SectorPreview() {
    const { data, isLoading, error } = useSectors()

    const sectors = data?.data?.slice(0, 3) || []

    return (
        <section className="section-padding bg-[var(--color-background)]">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
                >
                    <div>
                        <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                            Our Locations
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-graphite)]">
                            PG in Popular Sectors
                        </h2>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/pg-locations" className="flex items-center gap-2">
                            View All Locations
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </motion.div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-clay)]" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-[var(--color-muted)]">Unable to load sectors. Please try again later.</p>
                    </div>
                ) : sectors.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[var(--color-muted)]">No sectors available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sectors.map((sector, index) => (
                            <motion.div
                                key={sector.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/pg-locations/${sector.slug}`}
                                    className="block p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] card-3d group h-full"
                                >
                                    <div className="flex items-center gap-2 text-[var(--color-clay)] mb-4">
                                        <MapPin className="w-5 h-5" />
                                        <span className="font-serif text-xl font-semibold">{sector.name}</span>
                                    </div>

                                    <p className="text-[var(--color-muted)] mb-4 line-clamp-2">
                                        {sector.description || `Premium PG accommodations in ${sector.name}, Noida.`}
                                    </p>

                                    {sector.metroStation && (
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-4">
                                            <Train className="w-4 h-4" />
                                            <span>{sector.metroStation}</span>
                                            {sector.metroDistance && (
                                                <span className="text-[var(--color-clay)]">({sector.metroDistance} km)</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                        <div>
                                            <p className="text-sm text-[var(--color-muted)]">Starting from</p>
                                            <p className="font-semibold text-[var(--color-graphite)]">
                                                {formatPriceRange(sector.priceRange?.min, sector.priceRange?.max)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-[var(--color-muted)]">Available</p>
                                            <p className="font-semibold text-[var(--color-clay)]">{sector.pgCount || 0} PGs</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center text-[var(--color-clay)] font-medium text-sm group-hover:gap-2 transition-all">
                                        Explore Sector
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

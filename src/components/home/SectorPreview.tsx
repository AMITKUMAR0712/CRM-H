'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Train, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const sectors = [
    {
        name: 'Sector 51',
        slug: 'sector-51',
        description: 'Tech hub, near metro station',
        metro: 'Sector 51 Metro',
        distance: '0.5 km',
        priceRange: '₹8,000 - ₹15,000',
        available: 5,
    },
    {
        name: 'Sector 62',
        slug: 'sector-62',
        description: 'Corporate hub, excellent connectivity',
        metro: 'Sector 62 Metro',
        distance: '0.8 km',
        priceRange: '₹7,000 - ₹12,000',
        available: 8,
    },
    {
        name: 'Sector 50',
        slug: 'sector-50',
        description: 'Peaceful residential area',
        metro: 'Sector 50 Metro',
        distance: '1.2 km',
        priceRange: '₹6,000 - ₹10,000',
        available: 3,
    },
]

export default function SectorPreview() {
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
                                className="block p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full"
                            >
                                <div className="flex items-center gap-2 text-[var(--color-clay)] mb-4">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-serif text-xl font-semibold">{sector.name}</span>
                                </div>

                                <p className="text-[var(--color-muted)] mb-4">
                                    {sector.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-4">
                                    <Train className="w-4 h-4" />
                                    <span>{sector.metro}</span>
                                    <span className="text-[var(--color-clay)]">({sector.distance})</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                    <div>
                                        <p className="text-sm text-[var(--color-muted)]">Starting from</p>
                                        <p className="font-semibold text-[var(--color-graphite)]">{sector.priceRange}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[var(--color-muted)]">Available</p>
                                        <p className="font-semibold text-[var(--color-clay)]">{sector.available} PGs</p>
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
            </div>
        </section>
    )
}

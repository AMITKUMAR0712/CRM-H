'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

const categories = ['All', 'Rooms', 'Common Areas', 'Food', 'Exterior']

const images = [
    { id: 1, category: 'Rooms', title: 'Single AC Room', sector: 'Sector 51' },
    { id: 2, category: 'Rooms', title: 'Double Sharing', sector: 'Sector 62' },
    { id: 3, category: 'Common Areas', title: 'Lounge', sector: 'Sector 51' },
    { id: 4, category: 'Food', title: 'Dining Area', sector: 'Sector 51' },
    { id: 5, category: 'Rooms', title: 'Triple Sharing', sector: 'Sector 50' },
    { id: 6, category: 'Exterior', title: 'Building Front', sector: 'Sector 62' },
    { id: 7, category: 'Common Areas', title: 'Study Room', sector: 'Sector 51' },
    { id: 8, category: 'Food', title: 'Kitchen', sector: 'Sector 62' },
]

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [lightbox, setLightbox] = useState<number | null>(null)

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter((img) => img.category === activeCategory)

    return (
        <div>
            <PageHero
                kicker="Gallery"
                title="A quick tour of SOHO PG"
                subtitle="Explore rooms, common areas, and facilities—crafted for comfort and daily convenience."
                actions={
                    <>
                        <Button asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/smart-finder">Shortlist a PG</Link>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 pb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${activeCategory === category
                                ? 'border-(--color-clay)/40 bg-(--color-clay)/12 text-(--color-clay) shadow-[0_14px_34px_rgba(160,120,90,0.14)]'
                                : 'border-(--color-border)/70 bg-(--color-surface)/70 text-(--color-graphite) hover:bg-(--color-limestone)'} backdrop-blur-md`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 }}
                            onClick={() => setLightbox(image.id)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-square overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_80px_rgba(0,0,0,0.16)]">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/25 to-transparent" />

                                <div className="absolute inset-0 flex items-end justify-start p-4">
                                    <div className="w-full rounded-2xl border border-white/10 bg-black/10 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                        <p className="font-semibold">{image.title}</p>
                                        <p className="text-sm text-white/80">{image.sector}</p>
                                    </div>
                                </div>

                                <div className="flex h-full w-full items-center justify-center text-(--color-muted)">
                                    Photo
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="relative mt-12 overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 text-center backdrop-blur-md">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/25 to-transparent" />
                    <h3 className="font-serif text-2xl font-semibold text-(--color-graphite)">Want to see it in person?</h3>
                    <p className="mt-2 text-(--color-muted)">Book a visit and we&apos;ll show you the best options for your budget.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="tel:+919876543210">Call Now</a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15"
                        onClick={() => setLightbox(null)}
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="max-w-5xl w-full aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md flex items-center justify-center text-white">
                        Full Image View
                    </div>
                </div>
            )}
        </div>
    )
}

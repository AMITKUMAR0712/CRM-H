'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X } from 'lucide-react'

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
        <div className="section-padding">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        Gallery
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
                        Take a virtual tour of our PG accommodations. See our rooms, common areas, and facilities.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                                    ? 'bg-[var(--color-clay)] text-white'
                                    : 'bg-[var(--color-limestone)] text-[var(--color-graphite)] hover:bg-[var(--color-border)]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setLightbox(image.id)}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-square bg-[var(--color-limestone)] rounded-xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-start p-4">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <p className="font-semibold">{image.title}</p>
                                        <p className="text-sm text-white/80">{image.sector}</p>
                                    </div>
                                </div>
                                <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                                    Photo
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12 p-8 bg-[var(--color-limestone)] rounded-2xl">
                    <h3 className="font-serif text-2xl font-semibold mb-4">Like What You See?</h3>
                    <p className="text-[var(--color-muted)] mb-6">Book a visit to see our rooms in person.</p>
                    <Button asChild>
                        <Link href="/contact">Book a Visit</Link>
                    </Button>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
                        onClick={() => setLightbox(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="max-w-4xl w-full aspect-video bg-[var(--color-graphite)] rounded-xl flex items-center justify-center text-white">
                        Full Image View
                    </div>
                </div>
            )}
        </div>
    )
}

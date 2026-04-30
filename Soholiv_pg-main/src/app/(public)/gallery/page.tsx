'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Loader2, Phone, MessageCircle, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/layout/PageHero'
import { useGallery, useSectors } from '@/lib/hooks'

const albums = [
    { id: 'all', name: 'All Photos' },
    { id: 'rooms', name: 'Rooms' },
    { id: 'common_areas', name: 'Common Areas' },
    { id: 'food', name: 'Food' },
    { id: 'neighborhood', name: 'Neighborhood' },
    { id: 'safety', name: 'Safety' },
]

const roomTypes = [
    { id: '', name: 'All Room Types' },
    { id: 'single', name: 'Single' },
    { id: 'double', name: 'Double' },
    { id: 'triple', name: 'Triple' },
]

export default function GalleryPage() {
    const [activeAlbum, setActiveAlbum] = useState('all')
    const [activeSector, setActiveSector] = useState('')
    const [activeRoomType, setActiveRoomType] = useState('')
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const { data: sectorsData } = useSectors()
    const sectors = sectorsData?.data || []

    const queryParams: Record<string, string> = {}
    if (activeAlbum !== 'all') queryParams.album = activeAlbum
    if (activeSector) queryParams.sectorSlug = activeSector

    const { data, isLoading, error } = useGallery(
        Object.keys(queryParams).length > 0 ? queryParams : undefined
    )

    const images = data?.data || []

    // Filter by room type client-side if needed
    const filteredImages = activeRoomType
        ? images.filter(img => img.album?.toLowerCase().includes(activeRoomType))
        : images

    const openLightbox = (index: number) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)
    const nextImage = () => {
        if (lightboxIndex !== null && lightboxIndex < filteredImages.length - 1) {
            setLightboxIndex(lightboxIndex + 1)
        }
    }
    const prevImage = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1)
        }
    }

    return (
        <div>
            <PageHero
                kicker="Gallery"
                title="See Our Spaces"
                subtitle="Explore our rooms, common areas, and neighborhood through real photos."
                actions={
                    <>
                        <Button asChild>
                            <Link href="/smart-finder">Find Your PG</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                {/* Filters */}
                <div className="mb-8 space-y-4">
                    {/* Album Filter */}
                    <div className="flex flex-wrap gap-2">
                        {albums.map((album) => (
                            <button
                                key={album.id}
                                onClick={() => setActiveAlbum(album.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeAlbum === album.id
                                        ? 'bg-[var(--color-clay)] text-white'
                                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-clay)]'
                                    }`}
                            >
                                {album.name}
                            </button>
                        ))}
                    </div>

                    {/* Sector and Room Type Filters */}
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={activeSector}
                            onChange={(e) => setActiveSector(e.target.value)}
<<<<<<< HEAD
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-(--color-surface) text-(--color-graphite) px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20"
=======
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20"
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                        >
                            <option value="">All Sectors</option>
                            {sectors.map((sector) => (
                                <option key={sector.id} value={sector.slug}>{sector.name}</option>
                            ))}
                        </select>

                        <select
                            value={activeRoomType}
                            onChange={(e) => setActiveRoomType(e.target.value)}
<<<<<<< HEAD
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-(--color-surface) text-(--color-graphite) px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20"
=======
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20"
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                        >
                            {roomTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-clay)]" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        Error loading gallery. Please try again.
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[var(--color-muted)]">No photos found for this filter.</p>
                        <Button onClick={() => { setActiveAlbum('all'); setActiveSector(''); setActiveRoomType(''); }} className="mt-4">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        key={`${activeAlbum}-${activeSector}-${activeRoomType}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => openLightbox(index)}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                            >
                                <Image
                                    src={image.url}
                                    alt={image.altText || 'Gallery image'}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-white text-sm font-medium">
                                            {image.caption || image.album}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* CTA Ribbon */}
                <div className="mt-12 relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-graphite)] text-white p-8">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="font-serif text-2xl font-bold mb-2">Like what you see?</h3>
                            <p className="text-gray-300">Schedule a visit to experience our spaces in person.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="secondary" className="bg-white text-[var(--color-graphite)] hover:bg-gray-100" asChild>
                                <Link href="/contact" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Book a Visit
                                </Link>
                            </Button>
                            <Button variant="secondary" className="bg-green-600 hover:bg-green-700 text-white" asChild>
<<<<<<< HEAD
                                <a href="https://wa.me/919871648677" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
=======
                                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </a>
                            </Button>
                            <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
<<<<<<< HEAD
                                <a href="tel:+919871648677" className="flex items-center gap-2">
=======
                                <a href="tel:+919876543210" className="flex items-center gap-2">
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
                                    <Phone className="w-4 h-4" />
                                    Call Now
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && filteredImages[lightboxIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {lightboxIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        )}

                        {lightboxIndex < filteredImages.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        )}

                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl max-h-[85vh] mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={filteredImages[lightboxIndex].url}
                                alt={filteredImages[lightboxIndex].altText || 'Gallery image'}
                                width={1200}
                                height={800}
                                className="object-contain w-full h-auto max-h-[80vh]"
                            />
                            {filteredImages[lightboxIndex].caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-center">{filteredImages[lightboxIndex].caption}</p>
                                </div>
                            )}
                        </motion.div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            {lightboxIndex + 1} / {filteredImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

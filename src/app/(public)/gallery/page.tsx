'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X, Loader2 } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'
import { useGallery } from '@/lib/hooks'
import Image from 'next/image'

const albumLabels: Record<string, string> = {
    all: 'All',
    rooms: 'Rooms',
    common: 'Common Areas',
    food: 'Food',
    exterior: 'Exterior',
    neighborhood: 'Neighborhood',
    safety: 'Safety',
}

export default function GalleryPage() {
    const [activeAlbum, setActiveAlbum] = useState('all')
    const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null)

    // Fetch gallery images with album filter
    const { data, isLoading, error } = useGallery(
        activeAlbum !== 'all' ? { album: activeAlbum } : undefined
    )

    const images = data?.data || []

    // Get unique albums from images for filter buttons
    const albums = ['all', 'rooms', 'common', 'food', 'exterior']

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
                    {albums.map((album) => (
                        <button
                            key={album}
                            onClick={() => setActiveAlbum(album)}
                            className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${activeAlbum === album
                                    ? 'border-(--color-clay)/40 bg-(--color-clay)/12 text-(--color-clay) shadow-[0_14px_34px_rgba(160,120,90,0.14)]'
                                    : 'border-(--color-border)/70 bg-(--color-surface)/70 text-(--color-graphite) hover:bg-(--color-limestone)'
                                } backdrop-blur-md`}
                        >
                            {albumLabels[album] || album}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-(--color-clay)" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500">Error loading gallery images.</p>
                    </div>
                )}

                {/* Gallery Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => setLightboxImage({ url: image.url, caption: image.caption || image.altText })}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 backdrop-blur-md shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_80px_rgba(0,0,0,0.16)]">
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/25 to-transparent" />

                                        <Image
                                            src={image.url}
                                            alt={image.altText || 'Gallery image'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />

                                        <div className="absolute inset-0 flex items-end justify-start p-4">
                                            <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                                <p className="font-semibold">{image.caption || image.altText || 'Gallery Image'}</p>
                                                <p className="text-sm text-white/80 capitalize">{albumLabels[image.album] || image.album}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-(--color-muted)">No images found in this album.</p>
                            </div>
                        )}
                    </div>
                )}

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
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setLightboxImage(null)}
                    >
                        <button
                            className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15"
                            onClick={() => setLightboxImage(null)}
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-5xl w-full aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={lightboxImage.url}
                                alt={lightboxImage.caption || 'Gallery image'}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                            {lightboxImage.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-center">
                                    {lightboxImage.caption}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

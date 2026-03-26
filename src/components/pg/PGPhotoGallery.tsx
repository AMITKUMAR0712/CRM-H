'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'

interface Photo {
    id: string
    url: string
    altText?: string | null
    caption?: string | null
    category?: string | null
    isFeatured: boolean
}

interface PGPhotoGalleryProps {
    photos: Photo[]
    pgName: string
}

export default function PGPhotoGallery({ photos, pgName }: PGPhotoGalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    if (photos.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/70 bg-[var(--color-limestone)] aspect-video flex items-center justify-center">
                <div className="text-center text-[var(--color-muted)]">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No photos available</p>
                </div>
            </div>
        )
    }

    const featuredPhoto = photos.find(p => p.isFeatured) || photos[0]
    const otherPhotos = photos.filter(p => p.id !== featuredPhoto.id).slice(0, 4)
    const totalPhotos = photos.length
    const remainingCount = totalPhotos - 5

    const openLightbox = (index: number) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)

    const nextImage = () => {
        if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
            setLightboxIndex(lightboxIndex + 1)
        }
    }

    const prevImage = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'Escape') closeLightbox()
    }

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
                {/* Featured Photo - Large */}
                <div
                    className="col-span-2 md:col-span-2 md:row-span-2 relative aspect-video md:aspect-auto md:h-[400px] cursor-pointer group overflow-hidden"
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={featuredPhoto.url}
                        alt={featuredPhoto.altText || pgName}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>

                {/* Other Photos - Small Grid */}
                {otherPhotos.map((photo, idx) => {
                    const isLast = idx === otherPhotos.length - 1 && remainingCount > 0
                    const actualIndex = photos.findIndex(p => p.id === photo.id)

                    return (
                        <div
                            key={photo.id}
                            className="relative aspect-square cursor-pointer group overflow-hidden"
                            onClick={() => openLightbox(actualIndex)}
                        >
                            <Image
                                src={photo.url}
                                alt={photo.altText || `${pgName} photo ${idx + 2}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                            {/* Show remaining count on last thumbnail */}
                            {isLast && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">+{remainingCount}</span>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Mobile: View all photos button */}
                {photos.length > 1 && (
                    <button
                        onClick={() => openLightbox(0)}
                        className="col-span-2 md:hidden py-3 text-center text-sm font-medium text-[var(--color-clay)] bg-[var(--color-surface)] border-t border-[var(--color-border)]"
                    >
                        View all {totalPhotos} photos
                    </button>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && photos[lightboxIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeLightbox}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-10"
                            aria-label="Close gallery"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Previous Button */}
                        {lightboxIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage() }}
                                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition z-10"
                                aria-label="Previous photo"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        )}

                        {/* Next Button */}
                        {lightboxIndex < photos.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage() }}
                                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition z-10"
                                aria-label="Next photo"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        )}

                        {/* Image */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl max-h-[85vh] mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={photos[lightboxIndex].url}
                                alt={photos[lightboxIndex].altText || `${pgName} photo`}
                                width={1200}
                                height={800}
                                className="object-contain w-full h-auto max-h-[80vh]"
                            />
                            {photos[lightboxIndex].caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-center">{photos[lightboxIndex].caption}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            {lightboxIndex + 1} / {photos.length}
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto py-2">
                            {photos.map((photo, idx) => (
                                <button
                                    key={photo.id}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx) }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={photo.url}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

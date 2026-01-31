'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Minus, Phone, MessageCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface PGData {
    id: string
    name: string
    slug: string
    monthlyRent: number
    roomType: string
    occupancyType: string
    hasAC: boolean
    hasWifi: boolean
    mealsIncluded: boolean
    hasParking?: boolean
    hasGym?: boolean
    hasPowerBackup?: boolean
    hasLaundry?: boolean
    hasTV?: boolean
    hasFridge?: boolean
    isFeatured: boolean
    availableRooms: number
    photos?: { url: string; altText?: string | null }[]
    sector?: { name: string }
}

interface CompareDrawerProps {
    isOpen: boolean
    onClose: () => void
    items: PGData[]
    onRemove: (id: string) => void
    onClearAll: () => void
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

function FeatureCell({ value }: { value: boolean | undefined }) {
    if (value === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />
    if (value === false) return <X className="w-5 h-5 text-red-400 mx-auto" />
    return <Minus className="w-5 h-5 text-gray-300 mx-auto" />
}

export default function CompareDrawer({ isOpen, onClose, items, onRemove, onClearAll }: CompareDrawerProps) {
    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (items.length === 0) return null

    const features = [
        { key: 'monthlyRent', label: 'Monthly Rent', render: (pg: PGData) => <span className="font-bold text-(--color-clay)">{formatPrice(pg.monthlyRent)}</span> },
        { key: 'roomType', label: 'Room Type', render: (pg: PGData) => roomTypeLabels[pg.roomType] || pg.roomType },
        { key: 'occupancyType', label: 'For', render: (pg: PGData) => occupancyLabels[pg.occupancyType] || pg.occupancyType },
        { key: 'availableRooms', label: 'Available Rooms', render: (pg: PGData) => `${pg.availableRooms} rooms` },
        { key: 'hasAC', label: 'AC', render: (pg: PGData) => <FeatureCell value={pg.hasAC} /> },
        { key: 'hasWifi', label: 'WiFi', render: (pg: PGData) => <FeatureCell value={pg.hasWifi} /> },
        { key: 'mealsIncluded', label: 'Meals Included', render: (pg: PGData) => <FeatureCell value={pg.mealsIncluded} /> },
        { key: 'hasParking', label: 'Parking', render: (pg: PGData) => <FeatureCell value={pg.hasParking} /> },
        { key: 'hasGym', label: 'Gym', render: (pg: PGData) => <FeatureCell value={pg.hasGym} /> },
        { key: 'hasPowerBackup', label: 'Power Backup', render: (pg: PGData) => <FeatureCell value={pg.hasPowerBackup} /> },
        { key: 'hasLaundry', label: 'Laundry', render: (pg: PGData) => <FeatureCell value={pg.hasLaundry} /> },
        { key: 'hasTV', label: 'TV', render: (pg: PGData) => <FeatureCell value={pg.hasTV} /> },
        { key: 'hasFridge', label: 'Fridge', render: (pg: PGData) => <FeatureCell value={pg.hasFridge} /> },
    ]

    const shareViaWhatsApp = () => {
        const text = `Compare these PGs:\n\n${items.map(pg => `${pg.name} - ${formatPrice(pg.monthlyRent)}/month`).join('\n')}\n\nFound on SOHO PG`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-(--color-graphite)">Compare PGs</h2>
                                <p className="text-sm text-muted">{items.length} PGs selected</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={shareViaWhatsApp}>
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Share
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onClearAll}>
                                    Clear All
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Comparison Table - Scrollable */}
                        <div className="flex-1 overflow-y-auto overflow-x-auto p-6">
                            <table className="w-full min-w-150">
                                <thead>
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-muted w-40">Feature</th>
                                        {items.map((pg) => (
                                            <th key={pg.id} className="text-center py-3 px-4 min-w-50">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => onRemove(pg.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden bg-(--color-limestone) mb-3">
                                                        {pg.photos?.[0] ? (
                                                            <Image
                                                                src={pg.photos[0].url}
                                                                alt={pg.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
                                                        )}
                                                    </div>
                                                    <p className="font-serif font-semibold text-(--color-graphite)">{pg.name}</p>
                                                    {pg.sector && <p className="text-xs text-muted">{pg.sector.name}</p>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {features.map((feature, idx) => (
                                        <tr key={feature.key} className={idx % 2 === 0 ? 'bg-surface/50' : ''}>
                                            <td className="py-3 px-4 font-medium text-(--color-graphite)">{feature.label}</td>
                                            {items.map((pg) => (
                                                <td key={pg.id} className="py-3 px-4 text-center">
                                                    {feature.render(pg)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-white border-t border-(--color-border) px-6 py-4 flex flex-wrap gap-3 justify-center">
                            <Button asChild>
                                <Link href="/contact">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book a Visit
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="tel:+919876543210">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Now
                                </a>
                            </Button>
                            <Button variant="secondary" className="bg-green-600 hover:bg-green-700 text-white" asChild>
                                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

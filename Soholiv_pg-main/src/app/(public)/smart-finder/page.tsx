'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Loader2, Share2, Scale, X, Star, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import PGCard from '@/components/pg/PGCard'
import PageHero from '@/components/layout/PageHero'
import CompareDrawer from '@/components/smart-finder/CompareDrawer'
import LeadForm from '@/components/forms/LeadForm'
import { usePGs, useSectors, useSmartCategories } from '@/lib/hooks'

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
    photos?: { url: string; altText?: string | null; isFeatured: boolean }[]
    sector?: { name: string; slug: string }
    amenities?: { amenity: { name: string; icon?: string } }[]
}

export default function SmartFinderPage() {
    const [showFilters, setShowFilters] = useState(false)
    const [search, setSearch] = useState('')
    const [compareItems, setCompareItems] = useState<PGData[]>([])
    const [showCompare, setShowCompare] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState({
        category: '',
        sector: '',
        roomType: '',
        occupancy: '',
        budget: '',
        hasAC: false,
        hasWifi: false,
        mealsIncluded: false,
        hasParking: false,
        hasGym: false,
        hasPowerBackup: false,
        hasLaundry: false,
        hasTV: false,
        hasFridge: false,
        metroDistance: '',
    })

    // Build API params from filters
    const apiParams = useMemo(() => {
        const params: Record<string, string> = {}

        if (selectedFilters.sector) params.sector = selectedFilters.sector
        if (selectedFilters.category) params.category = selectedFilters.category
        if (selectedFilters.roomType) params.roomType = selectedFilters.roomType
        if (selectedFilters.occupancy) params.occupancyType = selectedFilters.occupancy
        if (selectedFilters.hasAC) params.hasAC = 'true'
        if (selectedFilters.hasWifi) params.hasWifi = 'true'
        if (selectedFilters.mealsIncluded) params.mealsIncluded = 'true'
        if (selectedFilters.hasParking) params.hasParking = 'true'
        if (selectedFilters.hasGym) params.hasGym = 'true'
        if (selectedFilters.hasPowerBackup) params.hasPowerBackup = 'true'
        if (selectedFilters.hasLaundry) params.hasLaundry = 'true'
        if (selectedFilters.hasTV) params.hasTV = 'true'
        if (selectedFilters.hasFridge) params.hasFridge = 'true'
        if (selectedFilters.metroDistance) params.metroDistance = selectedFilters.metroDistance
        if (search.trim()) params.search = search.trim()

        if (selectedFilters.budget) {
            const [min, max] = selectedFilters.budget.split('-').map(n => n.trim())
            if (min) params.minRent = min
            if (max) params.maxRent = max
        }

        return params
    }, [selectedFilters, search])

    const { data: pgsData, isLoading: pgsLoading, error: pgsError } = usePGs(apiParams)
    const { data: sectorsData } = useSectors()
    const { data: categoriesData } = useSmartCategories()

    const updateFilter = (key: string, value: string | boolean) => {
        setSelectedFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setSelectedFilters({
            category: '',
            sector: '',
            roomType: '',
            occupancy: '',
            budget: '',
            hasAC: false,
            hasWifi: false,
            mealsIncluded: false,
            hasParking: false,
            hasGym: false,
            hasPowerBackup: false,
            hasLaundry: false,
            hasTV: false,
            hasFridge: false,
            metroDistance: '',
        })
        setSearch('')
    }

    const toggleCompare = (pg: PGData) => {
        setCompareItems(prev => {
            const exists = prev.find(p => p.id === pg.id)
            if (exists) return prev.filter(p => p.id !== pg.id)
            if (prev.length >= 3) return prev // Max 3 items
            return [...prev, pg]
        })
    }

    const isInCompare = (id: string) => compareItems.some(p => p.id === id)

    const shareViaWhatsApp = () => {
        const pgs = pgsData?.data || []
        const text = `Check out these PGs on SOHO PG:\n\n${pgs.slice(0, 5).map(pg => `• ${pg.name} - ₹${pg.monthlyRent}/month`).join('\n')}\n\nFind more at: ${window.location.href}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const pgs = pgsData?.data || []
    const sectors = sectorsData?.data || []
    const categories = categoriesData?.data || []

    const filters = {
        categories: [
            { value: '', label: 'All Categories' },
            ...categories.map(c => ({ value: c.slug, label: c.name }))
        ],
        sectors: [
            { value: '', label: 'All Sectors' },
            ...sectors.map(s => ({ value: s.slug, label: s.name }))
        ],
        roomTypes: [
            { value: '', label: 'All Room Types' },
            { value: 'SINGLE', label: 'Single' },
            { value: 'DOUBLE', label: 'Double' },
            { value: 'TRIPLE', label: 'Triple' },
            { value: 'FOUR_SHARING', label: '4-Sharing' },
        ],
        occupancy: [
            { value: '', label: 'All' },
            { value: 'BOYS', label: 'Boys Only' },
            { value: 'GIRLS', label: 'Girls Only' },
            { value: 'CO_LIVING', label: 'Co-Living' },
        ],
        budgets: [
            { value: '', label: 'Any Budget' },
            { value: '0-8000', label: 'Under ₹8,000' },
            { value: '8000-12000', label: '₹8,000 - ₹12,000' },
            { value: '12000-15000', label: '₹12,000 - ₹15,000' },
            { value: '15000-50000', label: 'Above ₹15,000' },
        ],
        metroDistance: [
            { value: '', label: 'Any Distance' },
            { value: '0.5', label: 'Within 0.5 km' },
            { value: '1', label: 'Within 1 km' },
            { value: '2', label: 'Within 2 km' },
        ],
    }

    // Get badge for PG
    const getPGBadge = (pg: PGData, index: number) => {
        if (pg.isFeatured) return { label: 'Featured', icon: Star, color: 'bg-amber-500' }
        if (index === 0 && pgs.length > 1) return { label: 'Top Ranked', icon: TrendingUp, color: 'bg-blue-500' }
        if (pg.monthlyRent <= 8000) return { label: 'Best Value', icon: Award, color: 'bg-green-500' }
        return null
    }

    return (
        <div>
            <PageHero
                kicker="Smart Finder"
                title="Find your perfect PG—faster"
                subtitle="Use smart filters to shortlist the right sector, budget, and room type."
                actions={
                    <>
                        <Button asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="tel:+919871648677">Call Now</a>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Filters Sidebar */}
                    <aside className={`lg:w-80 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-24 rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/26 to-transparent" />
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-lg font-semibold">Filters</h2>
                                <button onClick={clearFilters} className="text-sm text-(--color-clay) hover:underline">
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Category</label>
                                <select
                                    className="w-full rounded-xl border border-(--color-border)/70 bg-(--color-surface) text-(--color-graphite) px-3 py-2 text-sm"
                                    value={selectedFilters.category}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                >
                                    {filters.categories.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search by PG name"
                                            className="pl-11 h-12"
                                        />
                                    </div>
                                </div>

                                {/* Sector */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sector</label>
                                    <select
                                        value={selectedFilters.sector}
                                        onChange={(e) => updateFilter('sector', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-graphite) px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                                    >
                                        {filters.sectors.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                                    </select>
                                </div>

                                {/* Room Type */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Room Type</label>
                                    <select
                                        value={selectedFilters.roomType}
                                        onChange={(e) => updateFilter('roomType', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-graphite) px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                                    >
                                        {filters.roomTypes.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                                    </select>
                                </div>

                                {/* Occupancy / Gender */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">For (Gender)</label>
                                    <select
                                        value={selectedFilters.occupancy}
                                        onChange={(e) => updateFilter('occupancy', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-graphite) px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                                    >
                                        {filters.occupancy.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                    </select>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Budget</label>
                                    <select
                                        value={selectedFilters.budget}
                                        onChange={(e) => updateFilter('budget', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-graphite) px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                                    >
                                        {filters.budgets.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
                                    </select>
                                </div>

                                {/* Metro Distance */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Metro Distance</label>
                                    <select
                                        value={selectedFilters.metroDistance}
                                        onChange={(e) => updateFilter('metroDistance', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-graphite) px-4 text-base focus:outline-none focus:ring-2 focus:ring-(--color-clay)/20"
                                    >
                                        {filters.metroDistance.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                                    </select>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Amenities</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: 'hasAC', label: 'AC' },
                                            { key: 'hasWifi', label: 'WiFi' },
                                            { key: 'mealsIncluded', label: 'Meals' },
                                            { key: 'hasParking', label: 'Parking' },
                                            { key: 'hasGym', label: 'Gym' },
                                            { key: 'hasPowerBackup', label: 'Power Backup' },
                                            { key: 'hasLaundry', label: 'Laundry' },
                                            { key: 'hasTV', label: 'TV' },
                                            { key: 'hasFridge', label: 'Fridge' },
                                        ].map((amenity) => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters[amenity.key as keyof typeof selectedFilters] as boolean}
                                                    onChange={(e) => updateFilter(amenity.key, e.target.checked)}
                                                    className="h-4 w-4 rounded border-(--color-border) accent-(--color-clay)"
                                                />
                                                {amenity.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        {/* Mobile Filter Button + Actions */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Filters'}
                            </Button>

                            {compareItems.length > 0 && (
                                <Button variant="secondary" onClick={() => setShowCompare(true)}>
                                    <Scale className="w-4 h-4 mr-2" />
                                    Compare ({compareItems.length})
                                </Button>
                            )}

                            <Button variant="outline" onClick={shareViaWhatsApp}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Results
                            </Button>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-muted">
                                {pgsLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Searching...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-(--color-graphite)">{pgs.length}</span> PGs found
                                    </>
                                )}
                            </p>
                        </div>

                        {/* PG List */}
                        <div className="space-y-6">
                            {pgsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-(--color-border) p-6 animate-pulse">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-48 h-40 bg-gray-200 rounded-xl" />
                                            <div className="flex-1 space-y-4">
                                                <div className="h-6 bg-gray-200 rounded w-1/3" />
                                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : pgsError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                                    <p className="text-red-600 font-medium">Error loading PGs</p>
                                    <p className="mt-1 text-sm text-red-500">Please try again later.</p>
                                </div>
                            ) : pgs.length > 0 ? (
                                pgs.map((pg, index) => {
                                    const badge = getPGBadge(pg, index)
                                    return (
                                        <motion.div
                                            key={pg.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative"
                                        >
                                            {/* Badge */}
                                            {badge && (
                                                <div className={`absolute -top-2 -right-2 z-10 ${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md`}>
                                                    <badge.icon className="w-3 h-3" />
                                                    {badge.label}
                                                </div>
                                            )}

                                            {/* Compare Toggle */}
                                            <button
                                                onClick={() => toggleCompare(pg)}
                                                className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isInCompare(pg.id)
                                                        ? 'bg-(--color-clay) text-white'
                                                        : 'bg-white/90 border border-(--color-border) text-muted hover:border-(--color-clay)'
                                                    }`}
                                                title={isInCompare(pg.id) ? 'Remove from compare' : 'Add to compare'}
                                            >
                                                {isInCompare(pg.id) ? <X className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                                            </button>

                                            <PGCard pg={pg} />
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 text-center backdrop-blur-md">
                                    <p className="text-(--color-graphite) font-medium">No PGs match these filters.</p>
                                    <p className="mt-1 text-sm text-muted">Try clearing a few filters or searching with fewer keywords.</p>
                                    <Button onClick={clearFilters} className="mt-4" variant="outline">
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Inline Lead Form after results */}
                        {!pgsLoading && pgs.length > 0 && (
                            <div className="mt-12 rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/22 to-transparent" />
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-(--color-graphite) mb-3">
                                            Can&apos;t find what you&apos;re looking for?
                                        </h3>
                                        <p className="text-muted">
                                            Tell us your requirements and we&apos;ll help you find the perfect PG. Our team will get back to you within 24 hours.
                                        </p>
                                    </div>
                                    <LeadForm />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Compare Drawer */}
            <CompareDrawer
                isOpen={showCompare}
                onClose={() => setShowCompare(false)}
                items={compareItems}
                onRemove={(id) => setCompareItems(prev => prev.filter(p => p.id !== id))}
                onClearAll={() => setCompareItems([])}
            />
        </div>
    )
}

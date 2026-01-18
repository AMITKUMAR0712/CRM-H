'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PGCard from '@/components/pg/PGCard'
import PageHero from '@/components/layout/PageHero'
import { usePGs, useSectors } from '@/lib/hooks'

export default function SmartFinderPage() {
    const [showFilters, setShowFilters] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedFilters, setSelectedFilters] = useState({
        sector: '',
        roomType: '',
        occupancy: '',
        budget: '',
        hasAC: false,
        hasWifi: false,
        mealsIncluded: false,
    })

    // Build API params from filters
    const apiParams = useMemo(() => {
        const params: Record<string, string> = {}

        if (selectedFilters.sector) params.sector = selectedFilters.sector
        if (selectedFilters.roomType) params.roomType = selectedFilters.roomType
        if (selectedFilters.occupancy) params.occupancyType = selectedFilters.occupancy
        if (selectedFilters.hasAC) params.hasAC = 'true'
        if (selectedFilters.hasWifi) params.hasWifi = 'true'
        if (selectedFilters.mealsIncluded) params.mealsIncluded = 'true'
        if (search.trim()) params.search = search.trim()

        // Budget parsing
        if (selectedFilters.budget) {
            const [min, max] = selectedFilters.budget.split('-').map(n => n.trim())
            if (min) params.minRent = min
            if (max) params.maxRent = max
        }

        return params
    }, [selectedFilters, search])

    // Fetch PGs from API
    const { data: pgsData, isLoading: pgsLoading, error: pgsError } = usePGs(apiParams)

    // Fetch sectors for the filter dropdown
    const { data: sectorsData } = useSectors()

    const updateFilter = (key: string, value: string | boolean) => {
        setSelectedFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setSelectedFilters({
            sector: '',
            roomType: '',
            occupancy: '',
            budget: '',
            hasAC: false,
            hasWifi: false,
            mealsIncluded: false,
        })
        setSearch('')
    }

    const pgs = pgsData?.data || []
    const sectors = sectorsData?.data || []

    const filters = {
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
                            <a href="tel:+919876543210">Call Now</a>
                        </Button>
                    </>
                }
            />

            <div className="container-custom pb-14">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Filters Sidebar */}
                    <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="relative sticky top-24 rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-6 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/26 to-transparent" />
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-lg font-semibold">Filters</h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-[var(--color-clay)] hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
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
                                        className="w-full h-12 rounded-lg border border-[var(--color-border)] bg-white px-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]"
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
                                        className="w-full h-12 rounded-lg border border-[var(--color-border)] bg-white px-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]"
                                    >
                                        {filters.roomTypes.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                                    </select>
                                </div>

                                {/* Occupancy */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">For</label>
                                    <select
                                        value={selectedFilters.occupancy}
                                        onChange={(e) => updateFilter('occupancy', e.target.value)}
                                        className="w-full h-12 rounded-lg border border-[var(--color-border)] bg-white px-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]"
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
                                        className="w-full h-12 rounded-lg border border-[var(--color-border)] bg-white px-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]"
                                    >
                                        {filters.budgets.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
                                    </select>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Amenities</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.hasAC}
                                                onChange={(e) => updateFilter('hasAC', e.target.checked)}
                                                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-clay)]"
                                            />
                                            <span className="text-sm">AC</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.hasWifi}
                                                onChange={(e) => updateFilter('hasWifi', e.target.checked)}
                                                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-clay)]"
                                            />
                                            <span className="text-sm">WiFi</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters.mealsIncluded}
                                                onChange={(e) => updateFilter('mealsIncluded', e.target.checked)}
                                                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-clay)]"
                                            />
                                            <span className="text-sm">Meals Included</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden mb-4">
                            <Button variant="outline" className="w-full" onClick={() => setShowFilters(!showFilters)}>
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[var(--color-muted)]">
                                {pgsLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Searching...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-[var(--color-graphite)]">{pgs.length}</span> PGs found
                                    </>
                                )}
                            </p>
                        </div>

                        {/* PG List */}
                        <div className="space-y-6">
                            {pgsLoading ? (
                                // Loading skeletons
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 animate-pulse">
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
                                pgs.map((pg, index) => (
                                    <motion.div
                                        key={pg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <PGCard pg={pg} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 text-center backdrop-blur-md">
                                    <p className="text-(--color-graphite) font-medium">No PGs match these filters.</p>
                                    <p className="mt-1 text-sm text-(--color-muted)">Try clearing a few filters or searching with fewer keywords.</p>
                                    <Button onClick={clearFilters} className="mt-4" variant="outline">
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Can't find CTA */}
                        {!pgsLoading && pgs.length > 0 && (
                            <div className="mt-10 text-center">
                                <p className="text-(--color-muted)">Can&apos;t find what you&apos;re looking for?</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-3">
                                    <Button asChild>
                                        <Link href="/contact">Talk to Support</Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                                            WhatsApp Us
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

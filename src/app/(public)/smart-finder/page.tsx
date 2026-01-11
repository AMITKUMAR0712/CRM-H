'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PGCard from '@/components/pg/PGCard'

const filters = {
    sectors: [
        { value: '', label: 'All Sectors' },
        { value: 'sector-50', label: 'Sector 50' },
        { value: 'sector-51', label: 'Sector 51' },
        { value: 'sector-52', label: 'Sector 52' },
        { value: 'sector-62', label: 'Sector 62' },
        { value: 'sector-76', label: 'Sector 76' },
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

// Sample PGs
const allPGs = [
    { id: '1', name: 'SOHO Premium', slug: 'soho-premium-51', monthlyRent: 12000, roomType: 'SINGLE', occupancyType: 'BOYS', hasAC: true, hasWifi: true, mealsIncluded: true, isFeatured: true, availableRooms: 3 },
    { id: '2', name: 'SOHO Comfort', slug: 'soho-comfort-51', monthlyRent: 8000, roomType: 'DOUBLE', occupancyType: 'CO_LIVING', hasAC: true, hasWifi: true, mealsIncluded: true, isFeatured: false, availableRooms: 5 },
    { id: '3', name: 'SOHO Budget', slug: 'soho-budget-62', monthlyRent: 6500, roomType: 'TRIPLE', occupancyType: 'BOYS', hasAC: false, hasWifi: true, mealsIncluded: true, isFeatured: false, availableRooms: 2 },
    { id: '4', name: 'SOHO Elite', slug: 'soho-elite-51', monthlyRent: 15000, roomType: 'SINGLE', occupancyType: 'GIRLS', hasAC: true, hasWifi: true, mealsIncluded: true, isFeatured: true, availableRooms: 1 },
]

export default function SmartFinderPage() {
    const [showFilters, setShowFilters] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState({
        sector: '',
        roomType: '',
        occupancy: '',
        budget: '',
        hasAC: false,
        hasWifi: false,
        mealsIncluded: false,
    })

    const updateFilter = (key: string, value: string | boolean) => {
        setSelectedFilters((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="section-padding">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-4">
                        Smart PG Finder
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
                        Find your perfect PG with our smart filters. Compare options and make the right choice.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-lg font-semibold">Filters</h2>
                                <button
                                    onClick={() => setSelectedFilters({ sector: '', roomType: '', occupancy: '', budget: '', hasAC: false, hasWifi: false, mealsIncluded: false })}
                                    className="text-sm text-[var(--color-clay)] hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Sector */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sector</label>
                                    <select
                                        value={selectedFilters.sector}
                                        onChange={(e) => updateFilter('sector', e.target.value)}
                                        className="w-full h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
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
                                        className="w-full h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
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
                                        className="w-full h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
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
                                        className="w-full h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
                                    >
                                        {filters.budgets.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
                                    </select>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Amenities</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={selectedFilters.hasAC} onChange={(e) => updateFilter('hasAC', e.target.checked)} className="rounded" />
                                            <span className="text-sm">AC</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={selectedFilters.hasWifi} onChange={(e) => updateFilter('hasWifi', e.target.checked)} className="rounded" />
                                            <span className="text-sm">WiFi</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={selectedFilters.mealsIncluded} onChange={(e) => updateFilter('mealsIncluded', e.target.checked)} className="rounded" />
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
                                <span className="font-semibold text-[var(--color-graphite)]">{allPGs.length}</span> PGs found
                            </p>
                        </div>

                        {/* PG List */}
                        <div className="space-y-6">
                            {allPGs.map((pg, index) => (
                                <motion.div
                                    key={pg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <PGCard pg={pg} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

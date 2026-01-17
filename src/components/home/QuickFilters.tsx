'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { IndianRupee, Users, Snowflake, Utensils } from 'lucide-react'

const filters = [
    {
        title: 'Budget PG',
        subtitle: '₹5,000 - ₹8,000/mo',
        icon: IndianRupee,
        href: '/smart-finder?maxRent=8000',
        color: 'bg-[var(--color-clay)]/12 text-[var(--color-clay)] ring-1 ring-[var(--color-clay)]/20',
    },
    {
        title: 'Single Room',
        subtitle: 'Private space',
        icon: Users,
        href: '/smart-finder?roomType=SINGLE',
        color: 'bg-[var(--color-olive)]/12 text-[var(--color-olive)] ring-1 ring-[var(--color-olive)]/20',
    },
    {
        title: 'AC Rooms',
        subtitle: 'Stay cool',
        icon: Snowflake,
        href: '/smart-finder?hasAC=true',
        color: 'bg-[var(--color-clay)]/12 text-[var(--color-clay)] ring-1 ring-[var(--color-clay)]/20',
    },
    {
        title: 'With Meals',
        subtitle: '3 meals/day',
        icon: Utensils,
        href: '/smart-finder?mealsIncluded=true',
        color: 'bg-[var(--color-olive)]/12 text-[var(--color-olive)] ring-1 ring-[var(--color-olive)]/20',
    },
]

export default function QuickFilters() {
    return (
        <section className="section-padding bg-[var(--color-background)]">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-graphite)] mb-4">
                        Quick Search
                    </h2>
                    <p className="text-[var(--color-muted)] max-w-xl mx-auto">
                        Find your perfect PG with one click. Choose what matters most to you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {filters.map((filter, index) => (
                        <motion.div
                            key={filter.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={filter.href}
                                className="block p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] card-3d group"
                            >
                                <div className={`w-12 h-12 rounded-xl ${filter.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <filter.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold text-[var(--color-graphite)] mb-1">
                                    {filter.title}
                                </h3>
                                <p className="text-sm text-[var(--color-muted)]">
                                    {filter.subtitle}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

'use client'

import { motion } from 'framer-motion'
import { Shield, Wifi, Utensils, Sparkles, Clock, Car, Zap, Users } from 'lucide-react'

const benefits = [
    {
        icon: Shield,
        title: '24/7 Security',
        description: 'CCTV surveillance and verified entry for safe PG living in Noida',
    },
    {
        icon: Wifi,
        title: 'High-Speed WiFi',
        description: 'Unlimited internet for office work, study, streaming and daily calls',
    },
    {
        icon: Utensils,
        title: 'Home-cooked Meals',
        description: 'Nutritious meals with affordable Noida PG rent plans',
    },
    {
        icon: Sparkles,
        title: 'Daily Housekeeping',
        description: 'Clean rooms and common areas across Soho Liv PG properties',
    },
    {
        icon: Clock,
        title: 'Fast Ticket Support',
        description: 'Raise CRM tickets for maintenance, food, cleaning or room issues',
    },
    {
        icon: Car,
        title: 'Parking Space',
        description: 'Secure two-wheeler and car parking at selected PG locations',
    },
    {
        icon: Zap,
        title: 'Power Backup',
        description: 'Power backup for uninterrupted work, study and living',
    },
    {
        icon: Users,
        title: 'Community Living',
        description: 'Best-fit PG community for students and professionals in Noida',
    },
]

export default function BenefitsGrid() {
    return (
        <section className="section-padding bg-[var(--color-limestone)]">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                        Why Choose Us
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-graphite)] mb-4">
                        Everything You Need in a Noida PG
                    </h2>
                    <p className="text-[var(--color-muted)] max-w-xl mx-auto">
                        Soho Liv combines affordable PG rent, AC rooms, food, WiFi, security, direct chat
                        and CRM ticket support for a smoother stay in Noida and Greater Noida.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] card-3d group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-clay)] group-hover:text-white transition-colors">
                                <benefit.icon className="w-6 h-6 text-[var(--color-clay)] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-serif text-lg font-semibold text-[var(--color-graphite)] mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

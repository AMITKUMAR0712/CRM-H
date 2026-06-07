'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
    {
        icon: Sparkles,
        title: 'Affordable PG Comfort',
        description: 'Budget luxury PG rooms in Noida with modern furniture, AC options, WiFi and meals.',
    },
    {
        icon: Shield,
        title: 'Safe Noida PGs',
        description: '24/7 security, CCTV surveillance and verified residents across Sector 51, 168 and 22.',
    },
    {
        icon: Users,
        title: 'Student & Professional Friendly',
        description: 'Co-living PGs built for working professionals, students and long-stay residents.',
    },
    {
        icon: Clock,
        title: 'CRM Ticket Support',
        description: 'Raise a ticket, chat directly and get PG service problems tracked quickly.',
    },
]

export default function AboutPreview() {
    return (
        <section className="section-padding bg-surface">
            <div className="container-custom">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-(--color-clay) text-sm font-medium uppercase tracking-widest mb-4 block">
                            About Soho Liv PG
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--color-graphite) mb-6">
                            Best PG Experience in Noida and Greater Noida
                        </h2>
                        <p className="text-muted text-lg mb-6 leading-relaxed">
                            Soho Liv started with a simple idea: finding a PG in Noida shouldn&apos;t be stressful
                            or overpriced. We focus on Sector 51, Sector 168 and Sector 22 Noida so residents
                            can stay close to offices, metro routes, colleges and daily markets.
                        </p>
                        <p className="text-muted mb-8">
                            From onboarding to daily living, our CRM-backed support helps residents raise
                            tickets, chat directly and get issues solved quickly while enjoying clean rooms,
                            meals, WiFi, security and some of the most competitive PG rates in Noida.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button asChild>
                                <Link href="/about" className="flex items-center gap-2">
                                    Learn More About Us
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/gallery">View Gallery</Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 * index, duration: 0.5, ease: "easeOut" }}
                                className="p-6 rounded-2xl bg-[var(--color-alabaster)] border border-[var(--color-border)] hover:border-[var(--color-clay)]/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="w-12 h-12 rounded-xl bg-(--color-clay)/10 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-(--color-clay)" />
                                </div>
                                <h3 className="font-semibold text-(--color-graphite) mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

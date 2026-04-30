'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
    {
        icon: Sparkles,
        title: 'Premium Comfort',
        description: 'Thoughtfully designed rooms with modern amenities for a comfortable stay.',
    },
    {
        icon: Shield,
        title: 'Safe & Secure',
        description: '24/7 security, CCTV surveillance, and verified residents for peace of mind.',
    },
    {
        icon: Users,
        title: 'Community Living',
        description: 'A balanced vibe—friendly when you want it, private when you need it.',
    },
    {
        icon: Clock,
        title: 'Hassle-Free',
        description: 'Responsive support and clear policies make daily life smooth.',
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
                            About SOHO PG
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-(--color-graphite) mb-6">
                            A Premium PG Experience in Noida
                        </h2>
                        <p className="text-muted text-lg mb-6 leading-relaxed">
                            SOHO PG started with a simple idea: finding a PG shouldn&apos;t be stressful.
                            We saw people compromise on basics—cleanliness, comfort, and clarity.
                            So we built spaces where the experience is consistent.
                        </p>
                        <p className="text-muted mb-8">
                            From onboarding to daily living, our goal is to make your stay calm,
                            organized, and premium—without the drama.
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

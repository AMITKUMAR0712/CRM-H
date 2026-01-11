'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronDown, Phone, MessageCircle } from 'lucide-react'

const headlines = [
    { main: 'Find Your', accent: 'Perfect PG', sub: 'in Noida' },
]

export default function Hero() {
    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-alabaster)] via-[var(--color-limestone)] to-[var(--color-alabaster)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-soft-grey) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Content */}
            <div className="container-custom relative z-10 text-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-clay)]/10 border border-[var(--color-clay)]/20 text-[var(--color-clay)] text-sm font-medium mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-[var(--color-clay)] animate-pulse" />
                        Premium PG Accommodation
                    </motion.div>

                    {/* Headline */}
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-graphite)] mb-6 leading-tight">
                        {headlines[0].main}{' '}
                        <span className="text-gradient">{headlines[0].accent}</span>
                        <br />
                        {headlines[0].sub}
                    </h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10"
                    >
                        Experience comfort, safety, and community living in Noida's finest paying guest accommodations.
                        AC rooms, meals included, 24/7 security.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button size="xl" asChild>
                            <Link href="/smart-finder">Find My Perfect PG</Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-6 mt-8"
                    >
                        <a
                            href="tel:+919876543210"
                            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-clay)] transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            +91 98765 43210
                        </a>
                        <a
                            href="https://wa.me/919876543210"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-green-600 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={scrollToContent}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-clay)] transition-colors"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
        </section>
    )
}

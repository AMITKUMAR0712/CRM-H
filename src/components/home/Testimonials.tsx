'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
    {
        name: 'Rahul Sharma',
        occupation: 'Software Engineer',
        sector: 'Sector 51',
        rating: 5,
        text: 'Best PG I have ever stayed in! The rooms are clean, food is amazing, and the staff is very helpful. Highly recommended for working professionals.',
    },
    {
        name: 'Priya Patel',
        occupation: 'Marketing Executive',
        sector: 'Sector 62',
        rating: 5,
        text: 'Safe and secure environment with all modern amenities. The WiFi speed is great for work from home. Very happy with my decision to stay here.',
    },
    {
        name: 'Amit Kumar',
        occupation: 'Data Analyst',
        sector: 'Sector 50',
        rating: 5,
        text: 'Peaceful location with good connectivity to major offices. The food quality is consistently good and the housekeeping is excellent.',
    },
]

export default function Testimonials() {
    return (
        <section className="section-padding bg-[var(--color-graphite)] text-white">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                        Testimonials
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                        What Our Residents Say
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-[var(--color-clay)] text-[var(--color-clay)]" />
                            ))}
                        </div>
                        <span className="text-gray-400">4.8/5 on Google Reviews</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Quote className="w-8 h-8 text-[var(--color-clay)] mb-4 opacity-50" />

                            <p className="text-gray-300 mb-6 leading-relaxed">
                                “{testimonial.text}”
                            </p>

                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[var(--color-clay)] text-[var(--color-clay)]" />
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-clay)] flex items-center justify-center text-white font-semibold">
                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {testimonial.occupation} • {testimonial.sector}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

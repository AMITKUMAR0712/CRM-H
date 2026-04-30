'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useReviews } from '@/lib/hooks'

export default function Testimonials() {
    const { data, isLoading, error } = useReviews()

    const reviews = data?.data?.reviews?.filter(r => r.isFeatured || r.isApproved).slice(0, 3) || []

    // Use stats from API or fallback
    const avgRating = data?.data?.stats?.averageRating || 4.8

    return (
        <section className="section-padding section-always-dark text-white">
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
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">
                        What Our Residents Say
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-[var(--color-clay)] text-[var(--color-clay)]" />
                            ))}
                        </div>
                        <span className="text-gray-300">{avgRating}/5 on Google Reviews</span>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-clay)]" />
                    </div>
                ) : error || reviews.length === 0 ? (
                    // Fallback testimonials
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Rahul Sharma',
                                occupation: 'Software Engineer',
                                rating: 5,
                                text: 'Best PG I have ever stayed in! The rooms are clean, food is amazing, and the staff is very helpful.',
                            },
                            {
                                name: 'Priya Patel',
                                occupation: 'Marketing Executive',
                                rating: 5,
                                text: 'Safe and secure environment with all modern amenities. Very happy with my decision to stay here.',
                            },
                            {
                                name: 'Amit Kumar',
                                occupation: 'Data Analyst',
                                rating: 5,
                                text: 'Peaceful location with good connectivity. The food quality is consistently good.',
                            },
                        ].map((testimonial, index) => (
                            <TestimonialCard key={index} {...testimonial} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map((review, index) => (
                            <TestimonialCard
                                key={review.id}
                                name={review.name}
                                occupation={review.occupation || 'Resident'}
                                rating={review.rating}
                                text={review.comment}
                                photo={review.photo}
                                pgName={review.pg?.name}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>

    )
}

function TestimonialCard({
    name,
    occupation,
    rating,
    text,
    photo,
    pgName,
    index,
}: {
    name: string
    occupation: string
    rating: number
    text: string
    photo?: string | null
    pgName?: string
    index: number
}) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
            <Quote className="w-8 h-8 text-[var(--color-clay)] mb-4 opacity-60" />

            <p className="text-gray-200 mb-6 leading-relaxed line-clamp-4">
                &ldquo;{text}&rdquo;
            </p>

            <div className="flex items-center gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--color-clay)] text-[var(--color-clay)]" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-white/20" />
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-[var(--color-clay)] flex items-center justify-center text-white font-semibold overflow-hidden">
                    {photo ? (
                        <Image
                            src={photo}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <p className="font-semibold text-white">{name}</p>
                    <p className="text-sm text-gray-300">
                        {occupation}{pgName && ` • ${pgName}`}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

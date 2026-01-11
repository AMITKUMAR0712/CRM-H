import { Metadata } from 'next'
import Image from 'next/image'
import { Shield, Heart, Users, Award, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about SOHO PG - our story, mission, and commitment to providing premium PG accommodation in Noida.',
}

const stats = [
    { value: '500+', label: 'Happy Residents' },
    { value: '5', label: 'Locations' },
    { value: '4.8', label: 'Google Rating' },
    { value: '10+', label: 'Years Experience' },
]

const values = [
    {
        icon: Shield,
        title: 'Safety First',
        description: '24/7 security, CCTV surveillance, and biometric entry systems ensure your safety.',
    },
    {
        icon: Heart,
        title: 'Home Away from Home',
        description: 'We create a warm, welcoming environment where you feel at home.',
    },
    {
        icon: Users,
        title: 'Community Living',
        description: 'Connect with like-minded professionals and students in our vibrant community.',
    },
    {
        icon: Award,
        title: 'Quality Standards',
        description: 'Daily housekeeping, hygienic meals, and well-maintained facilities.',
    },
]

const promises = [
    'Clean & hygienic rooms',
    'Fresh home-cooked meals',
    'High-speed WiFi',
    '24/7 power backup',
    'Daily housekeeping',
    'Secure parking',
    'Laundry service',
    'Water purifier',
]

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="section-padding bg-[var(--color-limestone)]">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                            About Us
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-graphite)] mb-6">
                            Your Trusted Partner for PG Living in Noida
                        </h1>
                        <p className="text-[var(--color-muted)] text-lg leading-relaxed">
                            Since 2014, SOHO PG has been providing premium paying guest accommodation to working professionals
                            and students in Noida. We believe in creating spaces that feel like home, with all the comforts
                            and none of the hassles.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-[var(--color-graphite)]">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-clay)] mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                                Our Story
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-graphite)] mb-6">
                                Building Homes, Not Just Rooms
                            </h2>
                            <div className="space-y-4 text-[var(--color-muted)]">
                                <p>
                                    SOHO PG was founded with a simple vision: to provide young professionals and students
                                    a comfortable, safe, and affordable place to live while pursuing their dreams in Noida.
                                </p>
                                <p>
                                    What started as a single property in Sector 51 has grown into a network of premium
                                    PG accommodations across 5 sectors in Noida. We've hosted over 500 residents and
                                    continue to grow while maintaining our commitment to quality.
                                </p>
                                <p>
                                    Our team understands the challenges of relocating to a new city. That's why we go
                                    beyond just providing a room - we create a complete living experience with home-cooked
                                    meals, housekeeping, and a supportive community.
                                </p>
                            </div>
                        </div>
                        <div className="bg-[var(--color-limestone)] rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-[var(--color-muted)]">Team Photo</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section-padding bg-[var(--color-limestone)]">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="text-[var(--color-clay)] text-sm font-medium uppercase tracking-widest mb-4 block">
                            Our Values
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-graphite)]">
                            What We Stand For
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="bg-white rounded-2xl p-6 text-center">
                                <div className="w-14 h-14 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="w-7 h-7 text-[var(--color-clay)]" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-[var(--color-muted)]">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promises */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="bg-[var(--color-graphite)] rounded-3xl p-8 md:p-12 text-white">
                        <div className="text-center mb-8">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Our Promise to You</h2>
                            <p className="text-gray-400 max-w-xl mx-auto">
                                Every SOHO PG property comes with these guaranteed amenities and services.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {promises.map((promise) => (
                                <div key={promise} className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-[var(--color-clay)] flex-shrink-0" />
                                    <span className="text-sm">{promise}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-gradient-to-br from-[var(--color-clay)] to-[var(--color-olive)] text-white text-center">
                <div className="container-custom">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                        Ready to Join the SOHO Family?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Experience the SOHO PG difference. Book a visit today and see why hundreds of residents trust us.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="xl" variant="white" asChild>
                            <Link href="/contact">Book a Visit</Link>
                        </Button>
                        <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-clay)]" asChild>
                            <Link href="/smart-finder">Find Your PG</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

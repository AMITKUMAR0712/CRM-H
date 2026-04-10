import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import HomeBanners from '@/components/home/HomeBanners'
import AboutPreview from '@/components/home/AboutPreview'
import QuickFilters from '@/components/home/QuickFilters'
import BenefitsGrid from '@/components/home/BenefitsGrid'
import SectorPreview from '@/components/home/SectorPreview'
import Testimonials from '@/components/home/Testimonials'
import CTASection from '@/components/home/CTASection'
import FloatingActions from '@/components/layout/FloatingActions'
import ChatbotWidget from '@/components/layout/ChatbotWidget'
import JsonLd from '@/components/seo/JsonLd'
import { generateLocalBusinessSchema, generateFAQSchema } from '@/lib/seo/structured-data'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
    'Soho Liv | Premium Co-living & PG Accommodation in Noida',
    'Experience "Budget Luxury" at Soho Liv. Premium PG rooms with AC, WiFi, home-style meals, and 3-tier security in Noida Sector 50, 51, 52, 62 & 76. Book a visit for the best stay in Delhi NCR.',
    '/',
    [
        'Soho Liv Noida',
        'budget luxury PG Noida',
        'premium co-living Noida',
        'PG near Sector 52 metro',
        'sector 62 PG for boys',
        'sector 51 PG for girls',
        'best PG with meals Noida',
    ]
)

export default function HomePage() {
    const localBusinessSchema = generateLocalBusinessSchema()

    const faqSchema = generateFAQSchema([
        {
            question: 'What is unique about Soho Liv co-living?',
            answer: 'Soho Liv offers "Budget Luxury"—premium co-living with designer interiors, ultra-high-speed WiFi, home-style meals, and 3-tier security at an affordable price point.',
        },
        {
            question: 'Where are Soho Liv properties located?',
            answer: 'We operate in major educational and IT hubs in Noida, including Sector 50, 51, 52, 62, and 76, ensuring proximity to metro stations.',
        },
        {
            question: 'What is the monthly rent for PG in Noida?',
            answer: 'Our PG rents start from ₹6,000 per month for sharing rooms and go up to ₹15,000 for single occupancy with all amenities included.',
        },
        {
            question: 'Is food included in the PG rent?',
            answer: 'Yes, most of our PG accommodations include nutritious meals (breakfast, lunch, and dinner) in the monthly rent.',
        },
    ])

    return (
        <>
            <JsonLd data={[localBusinessSchema, faqSchema]} />
            <Navbar />
            <main>
                <HomeBanners />
                <Hero />
                <AboutPreview />
                <QuickFilters />
                <BenefitsGrid />
                <SectorPreview />
                <Testimonials />
                <CTASection />
            </main>
            <Footer />
            <ChatbotWidget />
            <FloatingActions />
        </>
    )
}

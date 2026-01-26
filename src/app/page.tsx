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
    'Premium PG Accommodation in Noida',
    'Find your perfect paying guest accommodation in Noida. Premium PG rooms with AC, WiFi, meals & 24/7 security in Sector 50, 51, 52, 62 & 76. Book your visit today!',
    '/',
    [
        'best PG in Noida',
        'affordable PG Noida',
        'PG with food Noida',
        'boys PG Noida',
        'girls PG Noida',
        'co-living Noida',
        'PG near metro Noida',
        'furnished PG Noida',
    ]
)

export default function HomePage() {
    const localBusinessSchema = generateLocalBusinessSchema()

    const faqSchema = generateFAQSchema([
        {
            question: 'What amenities are included in SOHO PG?',
            answer: 'Our PG accommodations include AC/Non-AC rooms, high-speed WiFi, nutritious meals, 24/7 security, power backup, laundry service, and housekeeping.',
        },
        {
            question: 'Which locations do you have PG in Noida?',
            answer: 'We have premium PG accommodations in Sector 50, 51, 52, 62, and 76 in Noida, all near metro stations and IT hubs.',
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

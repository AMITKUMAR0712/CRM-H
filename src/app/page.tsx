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
    'Best PG in Noida & Greater Noida | Soho Liv Affordable PG',
    'Soho Liv offers the best PG in Noida and Greater Noida with affordable AC rooms, meals, WiFi, 24/7 security, CRM ticket support, direct chat and fast issue resolution in Sector 168, Sector 22 and Sector 51 Noida.',
    '/',
    [
        'best PG in Noida',
        'best PG in Greater Noida',
        'cheapest PG in Noida',
        'affordable PG in Noida',
        'Soho Liv Noida PG',
        'PG near Sector 52 metro',
        'Sector 168 Noida PG',
        'Sector 22 Noida PG',
        'Sector 51 Noida PG',
        'Noida PG with CRM support',
        'best PG with meals Noida',
    ]
)

export default function HomePage() {
    const localBusinessSchema = generateLocalBusinessSchema()

    const faqSchema = generateFAQSchema([
        {
            question: 'Why is Soho Liv one of the best PG options in Noida?',
            answer: 'Soho Liv combines affordable rent, AC rooms, WiFi, home-style meals, 24/7 security, direct chat support and a CRM ticket system so resident issues are tracked and resolved quickly.',
        },
        {
            question: 'Where are Soho Liv properties located?',
            answer: 'Soho Liv focuses on high-demand PG locations in Noida including Sector 51, Sector 168 and Sector 22, with connectivity to metro stations, offices, colleges and daily markets.',
        },
        {
            question: 'What is the monthly rent for PG in Noida?',
            answer: 'Our PG rents are kept competitive for Noida and Greater Noida. Shared and private options vary by sector and room type, with transparent pricing and essential amenities included.',
        },
        {
            question: 'Can residents raise tickets for PG problems?',
            answer: 'Yes. Soho Liv has a proper CRM and resident support flow where users can raise tickets, chat directly and get maintenance or service issues resolved as quickly as possible.',
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

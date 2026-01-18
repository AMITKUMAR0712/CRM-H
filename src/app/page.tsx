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

export default function HomePage() {
  return (
    <>
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

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import QuickFilters from '@/components/home/QuickFilters'
import BenefitsGrid from '@/components/home/BenefitsGrid'
import SectorPreview from '@/components/home/SectorPreview'
import Testimonials from '@/components/home/Testimonials'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickFilters />
        <BenefitsGrid />
        <SectorPreview />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

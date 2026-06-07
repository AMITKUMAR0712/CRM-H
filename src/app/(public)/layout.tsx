import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/layout/ChatbotWidget'
import FloatingActions from '@/components/layout/FloatingActions'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-20 pb-20 md:pb-0">{children}</main>
            <Footer />
            <ChatbotWidget />
            <FloatingActions />
        </>
    )
}

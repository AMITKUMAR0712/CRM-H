import { Metadata } from 'next'
import PageHero from '@/components/layout/PageHero'
import { FileText, Gavel, Calendar, CreditCard, ShieldAlert, Wrench, Globe, UserCheck, AlertTriangle } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = generatePageMetadata(
    'Terms & Conditions - SoHo Liv PG',
    'Review the terms and conditions for staying at SoHo Liv PG. Guidelines, booking rules, and resident code of conduct.',
    '/terms',
    ['terms and conditions', 'PG rules Noida', 'SoHo Liv terms', 'booking policy']
)

export default function TermsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms & Conditions', url: '/terms' },
    ])

    const sections = [
        {
            title: "1. Nature of Agreement",
            icon: FileText,
            content: "Occupancy at any Soho Liv property is on a Paying Guest (Licensee) basis and does not create a landlord-tenant relationship. Residents do not have exclusive possession of the premises, and Soho Liv reserves the right to reallocate rooms if necessary."
        },
        {
            title: "2. Eligibility and Booking",
            icon: UserCheck,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Age:</strong> You must be at least 18 years old to book independently. Minors must have a parent or guardian sign as a co-applicant.</li>
                    <li><strong>Accuracy:</strong> You agree to provide truthful and complete information during the registration and police verification process.</li>
                    <li><strong>Documentation:</strong> Booking is confirmed only upon submission of valid government ID (Aadhaar, PAN, etc.) and completion of required police verification.</li>
                </ul>
            )
        },
        {
            title: "3. Payment Terms",
            icon: CreditCard,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Rent:</strong> Monthly rent must be paid in advance by the due date specified in your booking confirmation.</li>
                    <li><strong>Late Fees:</strong> Delayed payments beyond the grace period may incur a penalty of ₹(Amount) per day.</li>
                    <li><strong>Security Deposit:</strong> A security deposit (typically 1 Month rent) is required at check-in. This is refundable within 30 days of checkout, subject to deductions for damages or unpaid dues.</li>
                </ul>
            )
        },
        {
            title: "4. Lock-In and Notice Period",
            icon: Calendar,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Lock-In Period:</strong> Most stays have a minimum commitment (typically 1 month). Exiting before this period may result in forfeiture of the security deposit.</li>
                    <li><strong>Notice Period:</strong> A written notice of 30 days is required before vacating. Failure to provide notice will result in the deduction of one month’s rent from the deposit.</li>
                </ul>
            )
        },
        {
            title: "5. Resident Code of Conduct",
            icon: ShieldAlert,
            content: (
                <div className="space-y-4">
                    <p>To maintain a &quot;Liveable Atmosphere&quot; all residents must adhere to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Strict Prohibitions:</strong> Consumption or possession of alcohol, drugs, or illegal substances is strictly forbidden and leads to immediate eviction.</li>
                        <li><strong>Visitors:</strong> Guests are permitted only during designated hours and in common areas. Overnight guests are generally not allowed without prior management approval.</li>
                        <li><strong>Noise & Decorum:</strong> Loud music and parties are prohibited to ensure a peaceful environment for all.</li>
                        <li><strong>Utility Usage:</strong> Residents must use water, electricity, and Wi-Fi judiciously. High-load appliances (like personal heaters or irons) may be restricted.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "6. Maintenance and Damages",
            icon: Wrench,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Housekeeping:</strong> Soho Liv provides regular cleaning of common areas and rooms.</li>
                    <li><strong>Liability:</strong> Residents are financially responsible for any damage caused to furniture, fittings, or electronic appliances beyond normal wear and tear.</li>
                </ul>
            )
        },
        {
            title: "7. Website Use and Intellectual Property",
            icon: Globe,
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li>All content on soholiv.com (logos, text, images) is the property of Soho Liv and protected by Indian copyright laws.</li>
                    <li>Users are prohibited from attempting to breach website security or using the site for fraudulent purposes.</li>
                </ul>
            )
        },
        {
            title: "8. Limitation of Liability",
            icon: AlertTriangle,
            content: "Soho Liv is not liable for the loss, theft, or damage of personal belongings. Residents are advised to keep their valuables secure and consider personal insurance."
        },
        {
            title: "9. Governing Law and Jurisdiction",
            icon: Gavel,
            content: "These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Noida/Delhi NCR."
        }
    ]

    return (
        <div className="min-h-screen">
            <JsonLd data={breadcrumbSchema} />
            <PageHero
                kicker="Legal"
                title="Terms & Conditions"
                subtitle="Welcome to Soho Liv. These terms govern your use of our website and co-living services."
            />

            <div className="container-custom pb-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2.5 rounded-lg bg-(--color-surface)/80 border border-(--color-border)/50 text-(--color-clay)">
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <h2 className="font-serif text-xl font-semibold text-(--color-graphite)">{section.title}</h2>
                            </div>
                            <div className="text-(--color-muted) leading-relaxed">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    <div className="text-center text-(--color-muted) text-sm pt-8">
                        By accessing our website or booking a stay, you agree to comply with and be bound by these terms.
                    </div>
                </div>
            </div>
        </div>
    )
}

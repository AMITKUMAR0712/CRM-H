import { Metadata } from 'next'
import PageHero from '@/components/layout/PageHero'
import { Shield, Info, Eye, Lock, UserCheck, Mail, Phone, MapPin } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = generatePageMetadata(
    'Privacy Policy - SoHo Liv PG',
    'Learn how SoHo Liv PG collects, uses, and safeguards your personal information and data security practices.',
    '/privacy',
    ['privacy policy', 'data security', 'SoHo Liv privacy', 'PG rules']
)

export default function PrivacyPage() {
    const lastUpdated = "April 3, 2026"

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
    ])

    const sections = [
        {
            title: "1. Information Collection",
            icon: Info,
            content: (
                <div className="space-y-4">
                    <p>To provide a premium co-living experience, we collect the following data:</p>
                    <ul className="list-disc pl-5 space-y-2 text-(--color-muted)">
                        <li><strong>Personal Identifiers:</strong> Name, gender, age, and contact details (email, phone, address).</li>
                        <li><strong>Verification Documents:</strong> Government IDs (Aadhar, PAN, Passport, Voter ID), proof of employment, or educational background to verify your identity.</li>
                        <li><strong>Financial Data:</strong> Bank account or card details for seamless rent and security deposit processing.</li>
                        <li><strong>Social Integration:</strong> If you log in via social media, we access public profile data (name, email, profile picture) as permitted by your account settings.</li>
                        <li><strong>Safety Monitoring:</strong> We reserve the right to record calls and chat logs on our Platform to resolve disputes and ensure resident safety.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "2. Digital Tracking & Cookies",
            icon: Eye,
            content: (
                <div className="space-y-4">
                    <p>We use Cookies, web beacons, and device IDs to improve Platform functionality and prevent fraud:</p>
                    <ul className="list-disc pl-5 space-y-2 text-(--color-muted)">
                        <li><strong>Usage Analytics:</strong> Identifying which features you use most to enhance your experience.</li>
                        <li><strong>Third-Party Ads:</strong> We may partner with ad networks (like Google) to show relevant offers based on your interests.</li>
                        <li><strong>Control:</strong> You can disable cookies in your browser, though some Platform features may be limited.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Purpose of Data Usage",
            icon: UserCheck,
            content: (
                <div className="space-y-4">
                    <p>Your information is strictly used for:</p>
                    <ul className="list-disc pl-5 space-y-2 text-(--color-muted)">
                        <li><strong>Service Delivery:</strong> Registering your stay and verifying your authority to use our facilities.</li>
                        <li><strong>Operational Needs:</strong> Processing payments, internal record-keeping, and market research.</li>
                        <li><strong>Communications:</strong> Sending transactional updates and occasional promotional offers (even if you are on the NCPR/DND list, by registering, you consent to these communications).</li>
                    </ul>
                </div>
            )
        },
        {
            title: "4. Data Security & Disclosure",
            icon: Lock,
            content: (
                <div className="space-y-4">
                    <p>We take your security seriously:</p>
                    <ul className="list-disc pl-5 space-y-2 text-(--color-muted)">
                        <li><strong>Security:</strong> As an ISO 27001:2013 certified company, we employ industry-standard encryption and procedural safeguards.</li>
                        <li><strong>Third-Party Sharing:</strong> Data may be shared with trusted vendors (payment gateways, credit bureaus) only as necessary to provide services.</li>
                        <li><strong>Legal Compliance:</strong> We will disclose information to law enforcement if required by a court order or governmental authority.</li>
                    </ul>
                </div>
            )
        },
        {
            title: "5. Your Rights & Control",
            icon: Shield,
            content: (
                <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2 text-(--color-muted)">
                        <li><strong>Access & Correction:</strong> You may review, update, or request the deletion of your data by emailing soholivpg@gmail.com.</li>
                        <li><strong>Account Closure:</strong> Upon request, we will remove your information from public view, though some data is retained for legal and audit purposes.</li>
                        <li><strong>Password Security:</strong> You are responsible for your account password. If compromised, notify us immediately.</li>
                    </ul>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen">
            <JsonLd data={breadcrumbSchema} />
            <PageHero
                kicker="Legal"
                title="Privacy Policy"
                subtitle={`Our commitment to protecting your privacy and security. Effective Date: ${lastUpdated}`}
            />

            <div className="container-custom pb-20">
                <div className="max-w-4xl mx-auto space-y-10">
                    {sections.map((section, idx) => (
                        <div key={idx} className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-(--color-surface)/80 border border-(--color-border)/50 text-(--color-clay)">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <h2 className="font-serif text-2xl font-semibold text-(--color-graphite)">{section.title}</h2>
                            </div>
                            <div className="text-(--color-graphite)/90 leading-relaxed">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    <div className="relative overflow-hidden rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 p-8 backdrop-blur-md shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-clay)/28 to-transparent" />
                        <h2 className="font-serif text-2xl font-semibold text-(--color-graphite) mb-6">Grievance Redressal</h2>
                        <p className="mb-6 text-(--color-muted)">
                            In accordance with the IT Rules, 2011, concerns regarding your data can be directed to our Grievance Officer:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Mr. Jitendra Dixit</h3>
                                <div className="flex items-start gap-3 text-(--color-muted)">
                                    <MapPin className="w-5 h-5 shrink-0 text-(--color-clay)" />
                                    <span>D 85/14, near Sector 52 Metro Station, Hoshiyarpur, Noida, UP 201301</span>
                                </div>
                                <div className="flex items-center gap-3 text-(--color-muted)">
                                    <Phone className="w-5 h-5 shrink-0 text-(--color-clay)" />
                                    <span>+91 9718999961</span>
                                </div>
                                <div className="flex items-center gap-3 text-(--color-muted)">
                                    <Mail className="w-5 h-5 shrink-0 text-(--color-clay)" />
                                    <span>jitendra@soholiv.com</span>
                                </div>
                            </div>
                            <div className="bg-(--color-surface)/50 p-6 rounded-xl border border-(--color-border)/50 h-fit">
                                <h4 className="font-semibold mb-2">Office Hours</h4>
                                <p className="text-(--color-muted)">Monday – Friday</p>
                                <p className="text-(--color-muted)">09:00 – 18:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-(--color-muted) text-sm pt-4">
                        © 2026 Soho Liv Co-living. All Rights Reserved.
                    </div>
                </div>
            </div>
        </div>
    )
}

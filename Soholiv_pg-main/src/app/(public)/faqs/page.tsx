import { Metadata } from 'next'
import PageHero from '@/components/layout/PageHero'
import { 
    ChevronDown, HelpCircle, BookOpen, CreditCard, Home, 
    ShieldCheck, DollarSign, Zap, Users, LogOut, Search 
} from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = generatePageMetadata(
    'Frequently Asked Questions - SoHo Liv PG',
    'Find answers to common questions about booking, rent, amenities, and living at SoHo Liv PG.',
    '/faqs',
    ['PG FAQs', 'booking help', 'PG rules', 'SoHo Liv support']
)

const faqCategories = [
    {
        title: "Booking & Onboarding",
        icon: BookOpen,
        questions: [
            {
                q: "Can I visit the property before booking?",
                a: "Yes, we highly recommend scheduling a site visit to see the rooms, common areas, and meet our community managers."
            },
            {
                q: "What documents are required for move-in?",
                a: "Standard documentation includes a valid Government ID proof (Aadhar, PAN, or Passport), permanent address proof, and employee/student verification."
            },
            {
                q: "What is the minimum stay duration?",
                a: "We offer flexible stays. While many residents stay long-term, we also accommodate short-term needs for as little as one month in select locations."
            }
        ]
    },
    {
        title: "Rent & Security Deposit",
        icon: CreditCard,
        questions: [
            {
                q: "What is included in the monthly rent?",
                a: "Our rent is all-inclusive of fully furnished accommodation, high-speed Wi-Fi, professional housekeeping, and 24/7 security. Utility charges like electricity may vary by location."
            },
            {
                q: "How much is the security deposit, and is it refundable?",
                a: "The security deposit is typically equal to 1–2 months' rent and is fully refundable upon move-out, subject to our refund policy and notice period."
            },
            {
                q: "How do I pay my rent?",
                a: "Payments can be made conveniently through our online portal using UPI, Credit/Debit cards, or Net Banking."
            }
        ]
    },
    {
        title: "Living & Amenities",
        icon: Home,
        questions: [
            {
                q: "What kind of food service do you provide?",
                a: "We provide nutritious, home-style meals (Breakfast and Dinner on weekdays; all meals on weekends). Check your specific property page for the current menu."
            },
            {
                q: "How often is housekeeping performed?",
                a: "To maintain high hygiene standards, we provide daily cleaning for common areas and regular scheduled housekeeping for individual rooms."
            },
            {
                q: "Are there any curfew timings?",
                a: "We believe in independent living, but for safety, we maintain standard entry/exit logs. Specific property-based gate timings (if any) are shared during onboarding."
            }
        ]
    },
    {
        title: "Policies & Community",
        icon: Users,
        questions: [
            {
                q: "What is the guest policy?",
                a: "Day guests are welcome in common areas. For overnight stays, prior approval from the community manager is required and may incur a nominal fee."
            },
            {
                q: "Is the PG couple-friendly?",
                a: "We have specific co-living properties that are couple-friendly. Please filter your search for \"Couple-friendly\" on our website."
            },
            {
                q: "Are pets allowed?",
                a: "While we love animals, pet policies depend on the specific property and room type. Contact our support team for a list of pet-friendly locations."
            }
        ]
    },
    {
        title: "Security & Safety",
        icon: ShieldCheck,
        questions: [
            {
                q: "How safe is the property?",
                a: "Safety is our priority. All Soho Liv properties are equipped with 24/7 CCTV surveillance and on-site security personnel."
            },
            {
                q: "What should I do if something in my room needs repair?",
                a: "You can raise a maintenance ticket through our portal Or Management Team. Our technical team usually addresses concerns within 24–48 hours."
            }
        ]
    },
    {
        title: "Financials & Transparency",
        icon: DollarSign,
        questions: [
            {
                q: "Are there any hidden charges like maintenance or water tax?",
                a: "No, your rent typically covers maintenance. Some properties may charge a small fixed monthly utility fee for water or common area backup, which will be clearly mentioned in your rental agreement."
            },
            {
                q: "How is the electricity bill calculated for shared rooms?",
                a: "Electricity is usually charged on actual consumption via sub-meters. In shared rooms, the total bill is divided equally among the roommates."
            },
            {
                q: "Is there a 'Lock-in Period'?",
                a: "Yes, most of our properties have a minimum stay (lock-in) of 3 to 6 months to maintain community stability. Leaving before this may result in a deposit deduction."
            },
            {
                q: "Can I get an invoice for HRA (House Rent Allowance) claims?",
                a: "Absolutely. We provide valid rent receipts and can share the owner's PAN details if required for your corporate HRA filings."
            }
        ]
    },
    {
        title: "Daily Convenience & Lifestyle",
        icon: Zap,
        questions: [
            {
                q: "Can I cook my own food?",
                a: "Yes, while we provide meals, we also have fully equipped community kitchens with induction stoves, microwaves, and refrigerators for those who enjoy cooking."
            },
            {
                q: "Is there a laundry facility on-site?",
                a: "Most properties feature a designated laundry area with industrial-grade washing machines. Some locations also offer professional laundry pickup services."
            },
            {
                q: "What is the internet speed, and is there a data cap?",
                a: "We provide high-speed, enterprise-grade Wi-Fi suitable for WFH (Work From Home). Most plans are unlimited, but high-usage caps may apply depending on the local provider."
            },
            {
                q: "Is there 24/7 power and water backup?",
                a: "Yes, all Soho Liv properties are equipped with DG (Diesel Generator) or Inverter backup for lights/Wi-Fi and RO water systems to ensure zero downtime."
            }
        ]
    },
    {
        title: "Community & Conduct",
        icon: Users,
        questions: [
            {
                q: "What happens if I have an issue with a roommate?",
                a: "We encourage open communication first. If the issue persists, our on-site Community Manager can mediate or help you relocate to a different room based on availability."
            },
            {
                q: "Are parties or loud music allowed?",
                a: "To respect everyone’s workspace and sleep cycles, we observe \"Quiet Hours\" (usually 10 PM to 8 AM). Loud parties are strictly prohibited within the premises."
            },
            {
                q: "Is smoking or alcohol permitted?",
                a: "Consumption of alcohol and smoking is strictly prohibited inside rooms and common areas to ensure a healthy and safe environment for all residents."
            },
            {
                q: "Can I personalize my room with posters or decor?",
                a: "You can personalize your space using detachable, damage-free hangers. However, painting walls or drilling holes is generally not permitted."
            }
        ]
    },
    {
        title: "Move-Out Process",
        icon: LogOut,
        questions: [
            {
                q: "How much notice do I need to give before vacating?",
                a: "A standard 30-day written notice is required through our app or portal. This allows us to process your refund and find a new resident for the bed."
            },
            {
                q: "What are 'Separation Charges'?",
                a: "These are nominal one-time charges (usually a few days' rent) deducted from the deposit for professional deep-cleaning and room painting after you move out."
            }
        ]
    }
]

export default function FAQPage() {
    const allFaqs = faqCategories.flatMap(cat => 
        cat.questions.map(q => ({ question: q.q, answer: q.a }))
    )

    const faqSchema = generateFAQSchema(allFaqs)
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'FAQs', url: '/faqs' },
    ])

    return (
        <div className="min-h-screen">
            <JsonLd data={[faqSchema, breadcrumbSchema]} />
            <PageHero
                kicker="Support"
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about your stay at Soho Liv. If you can't find an answer here, feel free to contact us."
            />

            <div className="container-custom pb-20">
                <div className="max-w-4xl mx-auto space-y-16">
                    {faqCategories.map((category, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 rounded-lg bg-(--color-surface)/80 border border-(--color-border)/50 text-(--color-clay)">
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold text-(--color-graphite)">{category.title}</h2>
                            </div>

                            <div className="grid gap-4">
                                {category.questions.map((item, qIdx) => (
                                    <details
                                        key={qIdx}
                                        className="group rounded-2xl border border-(--color-border)/70 bg-(--color-alabaster)/75 overflow-hidden transition-all duration-300"
                                    >
                                        <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-(--color-graphite) hover:bg-(--color-surface)/50">
                                            <span className="pr-4">{item.q}</span>
                                            <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open:rotate-180 text-(--color-clay) shrink-0" />
                                        </summary>
                                        <div className="px-6 pb-6 text-(--color-muted) leading-relaxed animate-fade-in">
                                            <div className="pt-2 border-t border-(--color-border)/30">
                                                {item.a}
                                            </div>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="mt-20 relative overflow-hidden rounded-3xl border border-(--color-border)/70 bg-(--color-graphite) p-10 text-center text-white shadow-2xl">
                        <div className="absolute inset-0 bg-linear-to-br from-(--color-clay)/20 to-transparent pointer-events-none" />
                        <HelpCircle className="w-12 h-12 mx-auto mb-6 text-(--color-clay)" />
                        <h3 className="font-serif text-2xl font-bold mb-4">Still have questions?</h3>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Our team is here to help you 24/7. Reach out to us via WhatsApp, Email, or Phone for instant support.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a 
                                href="/contact" 
                                className="px-8 py-3 bg-(--color-clay) text-white rounded-xl font-semibold hover:bg-(--color-clay)/90 transition-all transition-transform active:scale-95"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

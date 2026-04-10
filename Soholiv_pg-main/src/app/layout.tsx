import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import Providers from "./providers"
import JsonLd from "@/components/seo/JsonLd"
import { generateOrganizationSchema, generateWebsiteSearchSchema } from "@/lib/seo/structured-data"
import { SITE_CONFIG, DEFAULT_KEYWORDS, LOCATION_KEYWORDS } from "@/lib/seo/constants"

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
})

const outfit = Outfit({
    variable: "--font-serif",
    subsets: ["latin"],
    display: "swap",
})

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
        default: SITE_CONFIG.title,
        template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    keywords: [
        ...DEFAULT_KEYWORDS,
        ...LOCATION_KEYWORDS,
        'affordable PG',
        'PG with food',
        'PG with WiFi',
        'AC PG',
        'boys hostel Noida',
        'girls hostel Noida',
        'co-living space Noida',
        'furnished PG',
        'PG near metro',
        'budget luxury living',
    ],
    authors: [{ name: "Jitendra Dixit" }],
    creator: "Soho Liv",
    publisher: "Soho Liv",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: SITE_CONFIG.locale,
        url: SITE_CONFIG.url,
        siteName: SITE_CONFIG.name,
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        images: [
            {
                url: `${SITE_CONFIG.url}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "SOHO PG - Premium PG Accommodation in Noida",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        creator: "@soholiv",
        site: "@soholiv",
        images: [`${SITE_CONFIG.url}/og-image.png`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: SITE_CONFIG.url,
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const organizationSchema = generateOrganizationSchema()
    const websiteSearchSchema = generateWebsiteSearchSchema()

    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <head>
                <JsonLd data={[organizationSchema, websiteSearchSchema]} />
            </head>
            <body className="antialiased">
                <Providers>
                    <SmoothScrollProvider>{children}</SmoothScrollProvider>
                </Providers>
            </body>
        </html>
    )
}

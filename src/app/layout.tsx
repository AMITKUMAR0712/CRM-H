import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import Providers from "./providers"
import JsonLd from "@/components/seo/JsonLd"
import { generateOrganizationSchema, generateWebsiteSearchSchema } from "@/lib/seo/structured-data"
import { SITE_CONFIG, DEFAULT_KEYWORDS, LOCATION_KEYWORDS } from "@/lib/seo/constants"

const GOOGLE_ANALYTICS_ID = "G-13BFFLVVFS"
const GOOGLE_TAG_MANAGER_ID = "GTM-WHNNP9J9"
const GOOGLE_SITE_VERIFICATION = "lN6LIQPc0x349J3sTrkKCoo-0RltMKsCf7m25ZPZ5t8"

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
        template: "%s | SOHO PG",
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
    ],
    authors: [{ name: "SOHO PG" }],
    creator: "SOHO PG",
    publisher: "SOHO PG",
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
        creator: "@sohopg",
        site: "@sohopg",
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
        google: GOOGLE_SITE_VERIFICATION,
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
                <Script
                    id="google-tag-manager"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');
                        `,
                    }}
                />
                <Script
                    id="google-analytics-src"
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                />
                <Script
                    id="google-analytics"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${GOOGLE_ANALYTICS_ID}');
                        `,
                    }}
                />
                <JsonLd data={[organizationSchema, websiteSearchSchema]} />
            </head>
            <body className="antialiased">
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`}
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    />
                </noscript>
                <Providers>
                    <SmoothScrollProvider>{children}</SmoothScrollProvider>
                </Providers>
            </body>
        </html>
    )
}

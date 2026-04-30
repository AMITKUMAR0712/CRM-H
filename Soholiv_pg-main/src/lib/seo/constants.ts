/**
 * SEO Constants and Configuration
 * Central place for all SEO-related constants
 */

export const SITE_CONFIG = {
    name: 'Soho Liv',
    title: 'Soho Liv | Premium Co-living & PG Accommodation in Noida',
    description: 'Experience "Budget Luxury" co-living at Soho Liv. Premium PG rooms with AC, WiFi, home-style meals & 3-tier security in Noida Sector 51, 168, and 22. 15 years of excellence.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://soholiv.com',
    locale: 'en_IN',
    type: 'website',
} as const

export const ORGANIZATION = {
    name: 'Soho Liv',
    legalName: 'Soho Liv Co-living',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://soholiv.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://soholiv.com'}/logo.png`,
    foundingDate: '2008',
    description: 'The gold standard for "Budget Luxury" co-living in Delhi NCR. Managing 500+ premium units with a focus on community, security, and comfort.',
    address: {
        streetAddress: 'D 85/14, near Sector 52 Metro Station, Hoshiyarpur',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN',
    },
    contactPoint: {
        telephone: '+91-9871648677',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
        'https://www.facebook.com/soholiv',
        'https://www.instagram.com/soholiv',
        'https://twitter.com/soholiv',
    ],
} as const

export const SOCIAL_HANDLES = {
    twitter: '@soholiv',
    facebook: 'soholiv',
    instagram: 'soholiv',
} as const

export const DEFAULT_KEYWORDS = [
    'Soho Liv PG',
    'PG in Noida',
    'paying guest Noida',
    'best PG Noida',
    'premium co-living Noida',
    'budget luxury PG',
    'PG near me',
    'boys PG Noida',
    'girls PG Noida',
    'furnished rooms Noida',
] as const

export const LOCATION_KEYWORDS = [
    'Sector 51',
    'Sector 168',
    'Sector 22',
    'Noida Expressway',
    'Noida Extension',
] as const

export const DEFAULT_OG_IMAGE = `${SITE_CONFIG.url}/og-image.png`

export const AUTHOR = {
    name: 'Jitendra Dixit',
    url: SITE_CONFIG.url,
} as const

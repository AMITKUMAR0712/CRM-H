/**
 * SEO Constants and Configuration
 * Central place for all SEO-related constants
 */

export const SITE_CONFIG = {
    name: 'Soho Liv',
    title: 'Best PG in Noida & Greater Noida | Soho Liv Budget Luxury PG',
    description: 'Book the best PG in Noida and Greater Noida with Soho Liv. Affordable AC PG rooms, meals, WiFi, 24/7 security, CRM ticket support and fast service in Sector 168, Sector 22 and Sector 51 Noida.',
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
    description: 'The gold standard for affordable "Budget Luxury" PG and co-living in Noida, Greater Noida and Delhi NCR. Managing 500+ premium units with CRM ticket support, direct chat, fast issue resolution, security, comfort and transparent pricing.',
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
    'best PG in Noida',
    'best PG in Greater Noida',
    'Noida PG',
    'Greater Noida PG',
    'paying guest Noida',
    'best paying guest in Noida',
    'premium co-living Noida',
    'affordable PG in Noida',
    'cheapest PG in Noida',
    'budget PG in Noida',
    'budget luxury PG',
    'PG near me',
    'boys PG Noida',
    'girls PG Noida',
    'co living PG Noida',
    'furnished rooms Noida',
    'PG with food Noida',
    'PG with WiFi Noida',
    'AC PG in Noida',
    'PG with CRM support',
    'PG with ticket support',
] as const

export const LOCATION_KEYWORDS = [
    'PG in Sector 51 Noida',
    'best PG in Sector 51 Noida',
    'PG in Sector 168 Noida',
    'best PG in Sector 168 Noida',
    'PG in Sector 22 Noida',
    'best PG in Sector 22 Noida',
    'Noida Expressway',
    'PG near Noida Expressway',
    'Noida Extension',
    'PG near Sector 52 Metro',
    'PG near Sector 142 Metro',
    'PG near Noida City Centre',
] as const

export const DEFAULT_OG_IMAGE = `${SITE_CONFIG.url}/og-image.png`

export const AUTHOR = {
    name: 'Jitendra Dixit',
    url: SITE_CONFIG.url,
} as const

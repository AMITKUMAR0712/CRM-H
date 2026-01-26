/**
 * SEO Constants and Configuration
 * Central place for all SEO-related constants
 */

export const SITE_CONFIG = {
    name: 'SOHO PG',
    title: 'SOHO PG | Premium PG Accommodation in Noida',
    description: 'Find your perfect paying guest accommodation in Noida. Premium PG rooms with AC, WiFi, meals & 24/7 security in Sector 50, 51, 52, 62 & 76.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sohopg.com',
    locale: 'en_IN',
    type: 'website',
} as const

export const ORGANIZATION = {
    name: 'SOHO PG',
    legalName: 'SOHO PG Accommodation Services',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sohopg.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sohopg.com'}/logo.png`,
    foundingDate: '2020',
    description: 'Premium paying guest accommodation provider in Noida',
    address: {
        streetAddress: 'Sector 62',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN',
    },
    contactPoint: {
        telephone: '+91-9876543210',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
        'https://www.facebook.com/sohopg',
        'https://www.instagram.com/sohopg',
        'https://twitter.com/sohopg',
    ],
} as const

export const SOCIAL_HANDLES = {
    twitter: '@sohopg',
    facebook: 'sohopg',
    instagram: 'sohopg',
} as const

export const DEFAULT_KEYWORDS = [
    'PG in Noida',
    'paying guest Noida',
    'PG near me',
    'best PG Noida',
    'PG accommodation',
    'boys PG Noida',
    'girls PG Noida',
    'co-living Noida',
    'affordable PG Noida',
    'PG with food',
] as const

export const LOCATION_KEYWORDS = [
    'Sector 50',
    'Sector 51',
    'Sector 52',
    'Sector 62',
    'Sector 76',
    'Noida Extension',
    'Greater Noida',
] as const

export const DEFAULT_OG_IMAGE = `${SITE_CONFIG.url}/og-image.png`

export const AUTHOR = {
    name: 'SOHO PG',
    url: SITE_CONFIG.url,
} as const

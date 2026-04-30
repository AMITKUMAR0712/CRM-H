/**
 * SEO Metadata Utilities
 * Centralized functions for generating metadata across the application
 */

import { Metadata } from 'next'
import { SITE_CONFIG, DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE, AUTHOR } from './constants'

interface MetadataParams {
    title?: string
    description?: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    publishedTime?: string
    modifiedTime?: string
    noIndex?: boolean
    canonical?: string
}

/**
 * Generate comprehensive metadata for any page
 */
export function generateMetadata(params: MetadataParams): Metadata {
    const {
        title,
        description = SITE_CONFIG.description,
        keywords = DEFAULT_KEYWORDS,
        image = DEFAULT_OG_IMAGE,
        url = SITE_CONFIG.url,
        type = 'website',
        publishedTime,
        modifiedTime,
        noIndex = false,
        canonical,
    } = params

    const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title
    const absoluteUrl = url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`
    const absoluteImage = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`

    // Flatten keywords array properly
    const keywordsArray: string[] = Array.isArray(keywords)
        ? keywords.flatMap(k => typeof k === 'string' ? [k] : Array.from(k))
        : []

    return {
        title: fullTitle,
        description,
        keywords: keywordsArray,
        authors: [AUTHOR],
        creator: SITE_CONFIG.name,
        publisher: SITE_CONFIG.name,
        alternates: {
            canonical: canonical || absoluteUrl,
        },
        openGraph: {
            type: type === 'product' ? 'website' : type, // OpenGraph doesn't support 'product' type
            locale: SITE_CONFIG.locale,
            url: absoluteUrl,
            title: fullTitle,
            description,
            siteName: SITE_CONFIG.name,
            images: [
                {
                    url: absoluteImage,
                    width: 1200,
                    height: 630,
                    alt: title || SITE_CONFIG.title,
                },
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [absoluteImage],
            creator: '@sohopg',
            site: '@sohopg',
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

/**
 * Generate metadata for static pages
 */
export function generatePageMetadata(
    title: string,
    description: string,
    path: string,
    additionalKeywords: string[] = []
): Metadata {
    return generateMetadata({
        title,
        description,
        keywords: [...DEFAULT_KEYWORDS, ...additionalKeywords],
        url: `${SITE_CONFIG.url}${path}`,
    })
}

/**
 * Generate metadata for PG detail pages
 */
export function generatePGMetadata(pg: {
    name: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    slug: string
    sector: { name: string; slug: string }
    roomType: string
    hasAC: boolean
    monthlyRent: number
    mealsIncluded: boolean
    photos: { url: string }[]
}): Metadata {
    const title = pg.metaTitle || `${pg.name} - PG in ${pg.sector.name}, Noida`
    const description =
        pg.metaDescription ||
        `${pg.name} in ${pg.sector.name}, Noida. ${pg.roomType} room, ${pg.hasAC ? 'AC' : 'Non-AC'}, ₹${pg.monthlyRent}/month. ${pg.mealsIncluded ? 'Meals included.' : ''} Book a visit today!`

    const keywords = [
        ...DEFAULT_KEYWORDS,
        `PG in ${pg.sector.name}`,
        `${pg.roomType} PG`,
        `${pg.hasAC ? 'AC' : 'Non-AC'} PG`,
        pg.name,
        `PG near ${pg.sector.name}`,
    ]

    return generateMetadata({
        title,
        description,
        keywords,
        url: `/pg/${pg.slug}`,
        type: 'product',
        image: pg.photos.length > 0 ? pg.photos[0].url : DEFAULT_OG_IMAGE,
    })
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(post: {
    title: string
    excerpt?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    slug: string
    featuredImage?: string | null
    publishedAt?: Date | null
    updatedAt?: Date | null
    tags?: { tag: { name: string } }[]
}): Metadata {
    const title = post.metaTitle || post.title
    const description = post.metaDescription || post.excerpt || ''

    const keywords = [
        ...DEFAULT_KEYWORDS,
        ...(post.tags?.map((t) => t.tag.name) || []),
    ]

    return generateMetadata({
        title,
        description,
        keywords,
        url: `/blog/${post.slug}`,
        type: 'article',
        image: post.featuredImage || DEFAULT_OG_IMAGE,
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
    })
}

/**
 * Generate metadata for location pages
 */
export function generateLocationMetadata(sector: {
    name: string
    slug: string
    description?: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    metroStation?: string | null
    pgCount?: number
}): Metadata {
    const title =
        sector.metaTitle || `PG in ${sector.name}, Noida | Best Paying Guest Accommodation`
    const description =
        sector.metaDescription ||
        sector.description ||
        `Find the best PG accommodation in ${sector.name}, Noida. ${sector.pgCount || 'Multiple'} verified PG options with AC, WiFi, meals & 24/7 security. ${sector.metroStation ? `Near ${sector.metroStation} Metro.` : ''}`

    const keywords = [
        ...DEFAULT_KEYWORDS,
        `PG in ${sector.name}`,
        `${sector.name} PG`,
        `paying guest ${sector.name}`,
        `PG near ${sector.name}`,
        ...(sector.metroStation ? [`PG near ${sector.metroStation}`] : []),
    ]

    return generateMetadata({
        title,
        description,
        keywords,
        url: `/pg-locations/${sector.slug}`,
    })
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${SITE_CONFIG.url}${cleanPath}`
}

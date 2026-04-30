/**
 * Structured Data (JSON-LD) Generators
 * Functions to generate Schema.org structured data for better SEO
 */

import { ORGANIZATION, SITE_CONFIG } from './constants'

/**
 * Organization Schema
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: ORGANIZATION.name,
        legalName: ORGANIZATION.legalName,
        url: ORGANIZATION.url,
        logo: ORGANIZATION.logo,
        foundingDate: ORGANIZATION.foundingDate,
        description: ORGANIZATION.description,
        address: {
            '@type': 'PostalAddress',
            ...ORGANIZATION.address,
        },
        contactPoint: {
            '@type': 'ContactPoint',
            ...ORGANIZATION.contactPoint,
        },
        sameAs: ORGANIZATION.sameAs,
    }
}

/**
 * Local Business Schema
 */
export function generateLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: ORGANIZATION.name,
        image: ORGANIZATION.logo,
        '@id': ORGANIZATION.url,
        url: ORGANIZATION.url,
        telephone: ORGANIZATION.contactPoint.telephone,
        priceRange: '₹₹',
        address: {
            '@type': 'PostalAddress',
            ...ORGANIZATION.address,
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 28.6139,
            longitude: 77.2090,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
        },
        sameAs: ORGANIZATION.sameAs,
    }
}

/**
 * Breadcrumb Schema
 */
export function generateBreadcrumbSchema(
    items: { name: string; url: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
        })),
    }
}

/**
 * Product Schema for PG listings
 */
export function generateProductSchema(pg: {
    name: string
    description?: string | null
    slug: string
    monthlyRent: number
    securityDeposit?: number | null
    availableRooms: number
    photos: { url: string }[]
    sector: { name: string }
    reviews?: { rating: number }[]
}) {
    const avgRating =
        pg.reviews && pg.reviews.length > 0
            ? pg.reviews.reduce((sum, r) => sum + r.rating, 0) / pg.reviews.length
            : undefined

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: pg.name,
        description: pg.description || `PG accommodation in ${pg.sector.name}, Noida`,
        image: pg.photos.length > 0 ? pg.photos.map((p) => p.url) : undefined,
        brand: {
            '@type': 'Brand',
            name: ORGANIZATION.name,
        },
        offers: {
            '@type': 'Offer',
            price: pg.monthlyRent,
            priceCurrency: 'INR',
            availability:
                pg.availableRooms > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
            url: `${SITE_CONFIG.url}/pg/${pg.slug}`,
            priceValidUntil: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString(),
            ...(pg.securityDeposit && {
                advanceBookingRequirement: {
                    '@type': 'QuantitativeValue',
                    value: pg.securityDeposit,
                    unitText: 'INR',
                },
            }),
        },
        ...(avgRating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating.toFixed(1),
                reviewCount: pg.reviews!.length,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    }
}

/**
 * Article Schema for blog posts
 */
export function generateArticleSchema(post: {
    title: string
    excerpt?: string | null
    metaDescription?: string | null
    slug: string
    featuredImage?: string | null
    publishedAt?: Date | null
    updatedAt?: Date | null
    author: { name: string }
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || post.metaDescription,
        image: post.featuredImage || undefined,
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        author: {
            '@type': 'Person',
            name: post.author.name,
        },
        publisher: {
            '@type': 'Organization',
            name: ORGANIZATION.name,
            logo: {
                '@type': 'ImageObject',
                url: ORGANIZATION.logo,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
        },
    }
}

/**
 * FAQ Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}

/**
 * Aggregate Rating Schema
 */
export function generateAggregateRatingSchema(
    itemName: string,
    ratings: number[],
    itemUrl?: string
) {
    if (ratings.length === 0) return null

    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length

    return {
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        itemReviewed: {
            '@type': 'Thing',
            name: itemName,
            ...(itemUrl && { url: itemUrl }),
        },
        ratingValue: avgRating.toFixed(1),
        reviewCount: ratings.length,
        bestRating: 5,
        worstRating: 1,
    }
}

/**
 * Place Schema for location pages
 */
export function generatePlaceSchema(sector: {
    name: string
    description?: string | null
    metroStation?: string | null
    metroDistance?: number | null
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: sector.name,
        description: sector.description || `${sector.name}, Noida`,
        address: {
            '@type': 'PostalAddress',
            addressLocality: sector.name,
            addressRegion: 'Uttar Pradesh',
            addressCountry: 'IN',
        },
        ...(sector.metroStation && {
            additionalProperty: {
                '@type': 'PropertyValue',
                name: 'Nearest Metro',
                value: `${sector.metroStation}${sector.metroDistance ? ` (${sector.metroDistance} km)` : ''}`,
            },
        }),
    }
}

/**
 * Website Search Action Schema
 */
export function generateWebsiteSearchSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: SITE_CONFIG.url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_CONFIG.url}/smart-finder?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

/**
 * Collection Page Schema for listing pages
 */
export function generateCollectionPageSchema(
    name: string,
    description: string,
    url: string,
    numberOfItems: number
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
        numberOfItems,
    }
}

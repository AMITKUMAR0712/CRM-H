/**
 * Dynamic Robots.txt Generation
 * Generates robots.txt with proper crawl directives
 */

import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/seo/constants'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_CONFIG.url

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/user/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/logout',
                    '/forbidden',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/user/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

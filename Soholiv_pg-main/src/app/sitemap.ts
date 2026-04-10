/**
 * Dynamic Sitemap Generation
 * Generates sitemap.xml for all pages in the application
 */

import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { SITE_CONFIG } from '@/lib/seo/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_CONFIG.url

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/smart-finder`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/pg-locations`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/faqs`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
    ]

    try {
        // PG detail pages
        const pgs = await prisma.pG.findMany({
            where: { isActive: true, approvalStatus: 'APPROVED' },
            select: {
                slug: true,
                updatedAt: true,
                isFeatured: true,
            },
            orderBy: { updatedAt: 'desc' },
        })

        const pgPages: MetadataRoute.Sitemap = pgs.map((pg) => ({
            url: `${baseUrl}/pg/${pg.slug}`,
            lastModified: pg.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: pg.isFeatured ? 0.9 : 0.7,
        }))

        // Location pages
        const sectors = await prisma.sector.findMany({
            where: { isActive: true },
            select: {
                slug: true,
                updatedAt: true,
            },
        })

        const locationPages: MetadataRoute.Sitemap = sectors.map((sector) => ({
            url: `${baseUrl}/pg-locations/${sector.slug}`,
            lastModified: sector.updatedAt,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        }))

        // Blog posts
        const posts = await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            select: {
                slug: true,
                updatedAt: true,
                publishedAt: true,
            },
            orderBy: { publishedAt: 'desc' },
        })

        const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }))

        return [...staticPages, ...pgPages, ...locationPages, ...blogPages]
    } catch (err) {
        console.error('[Sitemap] Failed to build dynamic entries', err)
        return staticPages
    }
}

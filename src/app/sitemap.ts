/**
 * Dynamic Sitemap Generation
 * Generates sitemap.xml for all pages in the application
 */

import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { SITE_CONFIG } from '@/lib/seo/constants'
import { getPGSeoSlug, getSectorSeoSlug } from '@/lib/seo/slugs'

const STATIC_PAGE_SLUGS = new Set(['about', 'contact', 'gallery', 'smart-finder', 'pg-locations', 'blog', 'privacy', 'terms', 'faqs'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_CONFIG.url.replace(/\/$/, '')
    const now = new Date()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/smart-finder`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/pg-locations`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/faqs`,
            lastModified: now,
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
                sector: { select: { slug: true } },
                updatedAt: true,
                isFeatured: true,
            },
            orderBy: { updatedAt: 'desc' },
        })

        const pgPages: MetadataRoute.Sitemap = pgs.map((pg) => ({
            url: `${baseUrl}/pg/${getPGSeoSlug(pg.slug, pg.sector.slug)}`,
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
            url: `${baseUrl}/pg-locations/${getSectorSeoSlug(sector.slug)}`,
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

        // Published CMS pages live under /p/[slug]. Static slugs redirect to direct routes,
        // so keep them out of the sitemap to avoid duplicate URLs.
        const cmsPages = await prisma.page.findMany({
            where: {
                isActive: true,
                status: 'PUBLISHED',
                deletedAt: null,
                slug: { notIn: Array.from(STATIC_PAGE_SLUGS) },
            },
            select: {
                slug: true,
                updatedAt: true,
                publishedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        })

        const cmsSitemapPages: MetadataRoute.Sitemap = cmsPages.map((page) => ({
            url: `${baseUrl}/p/${page.slug}`,
            lastModified: page.publishedAt || page.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        }))

        return [...staticPages, ...pgPages, ...locationPages, ...blogPages, ...cmsSitemapPages]
    } catch (err) {
        console.error('[Sitemap] Failed to build dynamic entries', err)
        return staticPages
    }
}

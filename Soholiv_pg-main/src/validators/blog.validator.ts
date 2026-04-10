import { z } from 'zod'
import { PostStatus } from '@prisma/client'

// ============================================
// BLOG VALIDATORS
// ============================================

export const blogPostCreateSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(100, 'Content must be at least 100 characters'),
    featuredImage: z.string().url().optional(),

    // SEO
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword: z.string().max(100).optional(),

    // Categorization
    categoryId: z.string().cuid().optional(),
    tagIds: z.array(z.string().cuid()).optional(),

    // Publishing
    status: z.nativeEnum(PostStatus).default('DRAFT'),
    publishedAt: z.string().datetime().optional(),

    // Engagement
    readTime: z.number().min(1).max(60).optional(),

    // Featured
    isFeatured: z.boolean().default(false),
})

export const blogPostUpdateSchema = blogPostCreateSchema.partial()

export const blogPostQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    status: z.nativeEnum(PostStatus).optional(),
    categoryId: z.string().cuid().optional(),
    tagId: z.string().cuid().optional(),
    search: z.string().optional(),
    isFeatured: z.string().optional(),
    sortBy: z.enum(['createdAt', 'publishedAt', 'title', 'viewCount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Category validators
export const categoryCreateSchema = z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    isActive: z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

// Tag validators
export const tagCreateSchema = z.object({
    name: z.string().min(2).max(30),
    slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/),
})

export const tagUpdateSchema = tagCreateSchema.partial()

export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>
export type BlogPostQueryParams = z.infer<typeof blogPostQuerySchema>
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type TagCreateInput = z.infer<typeof tagCreateSchema>

import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api-client'

export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt?: string
    content: string
    featuredImage?: string
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    publishedAt?: string
    viewCount: number
    readTime?: number
    isFeatured: boolean
    category?: {
        id: string
        name: string
        slug: string
    }
    author: {
        id: string
        name: string
        avatar?: string
    }
    tags?: {
        tag: {
            id: string
            name: string
            slug: string
        }
    }[]
}

export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    _count?: {
        posts: number
    }
}

interface BlogPostsResponse {
    success: boolean
    data: BlogPost[]
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

interface BlogPostResponse {
    success: boolean
    data: BlogPost
}

interface CategoriesResponse {
    success: boolean
    data: Category[]
}

// Fetch blog posts with optional filters
export function useBlogPosts(params?: {
    category?: string
    tag?: string
    status?: string
    page?: string
    limit?: string
    featured?: string
}) {
    const queryParams: Record<string, string> = {}
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams[key] = value
        })
    }

    return useQuery<BlogPostsResponse>({
        queryKey: ['blog-posts', queryParams],
        queryFn: () => blogApi.getPosts(queryParams) as Promise<BlogPostsResponse>,
        staleTime: 1000 * 60, // 1 minute
    })
}

// Fetch a single blog post by slug
export function useBlogPost(slug: string) {
    return useQuery<BlogPostResponse>({
        queryKey: ['blog-post', slug],
        queryFn: () => blogApi.getBySlug(slug) as Promise<BlogPostResponse>,
        enabled: !!slug,
    })
}

// Fetch categories
export function useCategories() {
    return useQuery<CategoriesResponse>({
        queryKey: ['blog-categories'],
        queryFn: () => blogApi.getCategories() as Promise<CategoriesResponse>,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

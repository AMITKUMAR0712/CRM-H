/**
 * Internal API client for Next.js API routes
 */

const API_BASE = '/api'

type FetchOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: unknown
    cache?: RequestCache
    revalidate?: number
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, cache, revalidate } = options

    const config: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    }

    if (body) {
        config.body = JSON.stringify(body)
    }
    if (cache) {
        config.cache = cache
    }
    if (revalidate) {
        (config as Record<string, unknown>).next = { revalidate }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
    }

    return data
}

// PG APIs
export const pgApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : ''
        return apiFetch(`/pgs${query}`, { cache: 'no-store' })
    },
    getById: (id: string) => apiFetch(`/pgs/${id}`),
    getFeatured: () => apiFetch('/pgs?isFeatured=true'),
}

// Sector APIs
export const sectorApi = {
    getAll: () => apiFetch('/sectors', { revalidate: 3600 }),
    getBySlug: (slug: string) => apiFetch(`/sectors/${slug}`),
}

// Smart Finder Category APIs
export const smartCategoryApi = {
    getAll: () => apiFetch('/smart-categories', { revalidate: 3600 }),
}

// Lead APIs (Public)
export const leadApi = {
    create: (data: unknown) => apiFetch('/leads', { method: 'POST', body: data }),
}

// Contact APIs
export const contactApi = {
    submit: (data: unknown) => apiFetch('/contact', { method: 'POST', body: data }),
}

// Blog APIs
export const blogApi = {
    getPosts: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : ''
        return apiFetch(`/blog/posts${query}`, { revalidate: 60 })
    },
    getBySlug: (slug: string) => apiFetch(`/blog/posts/${slug}`),
    getCategories: () => apiFetch('/blog/categories', { revalidate: 3600 }),
    getTags: () => apiFetch('/blog/tags', { revalidate: 3600 }),
}

// Gallery APIs
export const galleryApi = {
    getImages: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : ''
        return apiFetch(`/gallery${query}`, { revalidate: 3600 })
    },
}

// FAQ APIs
export const faqApi = {
    getAll: () => apiFetch('/faqs', { revalidate: 3600 }),
}

// Review APIs
export const reviewApi = {
    getAll: () => apiFetch('/reviews?approved=true', { revalidate: 3600 }),
    create: (data: unknown) => apiFetch('/reviews', { method: 'POST', body: data }),
}

// Settings APIs
export const settingsApi = {
    getPublic: () => apiFetch('/settings?public=true', { revalidate: 3600 }),
}

// Comparison APIs
export const comparisonApi = {
    create: (pgIds: string[]) => apiFetch('/comparisons', { method: 'POST', body: { pgIds } }),
    getByCode: (code: string) => apiFetch(`/comparisons/${code}`),
}

// Amenities APIs
export const amenityApi = {
    getAll: () => apiFetch('/amenities', { revalidate: 3600 }),
}

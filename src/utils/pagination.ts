// Pagination utilities for consistent pagination across API routes

export interface PaginationParams {
    page: number
    limit: number
    skip: number
}

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

/**
 * Parse pagination parameters from search params
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE)))
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)))
    )
    const skip = (page - 1) * limit

    return { page, limit, skip }
}

/**
 * Build pagination query params for Prisma
 */
export function paginationQuery(params: PaginationParams) {
    return {
        skip: params.skip,
        take: params.limit,
    }
}

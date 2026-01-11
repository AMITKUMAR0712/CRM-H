// Standard API response types and helpers for consistent API responses

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: string
    meta?: PaginationMeta
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

/**
 * Create a success response
 */
export function success<T>(data: T, message?: string): ApiResponse<T> {
    return { success: true, data, message }
}

/**
 * Create an error response
 */
export function error(errorMessage: string): ApiResponse {
    return { success: false, error: errorMessage }
}

/**
 * Create a paginated response
 */
export function paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): ApiResponse<T[]> {
    return {
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

/**
 * Create a created response (201)
 */
export function created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return { success: true, data, message }
}

/**
 * Create a deleted response
 */
export function deleted(message = 'Deleted successfully'): ApiResponse {
    return { success: true, message }
}

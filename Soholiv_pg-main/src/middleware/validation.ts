import { NextResponse } from 'next/server'
import { ZodSchema, ZodError, ZodIssue } from 'zod'

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
    request: Request,
    schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
    try {
        let body = {}
        const text = await request.text()
        if (text) {
            body = JSON.parse(text)
        }
        const data = schema.parse(body)
        return { data }
    } catch (err) {
        if (err instanceof ZodError) {
            const errors = err.issues.map((e: ZodIssue) => ({
                field: e.path.join('.'),
                message: e.message,
            }))

            return {
                error: NextResponse.json(
                    {
                        success: false,
                        error: 'Validation failed',
                        details: errors
                    },
                    { status: 400 }
                ),
            }
        }

        if (err instanceof SyntaxError) {
            return {
                error: NextResponse.json(
                    { success: false, error: 'Invalid JSON in request body' },
                    { status: 400 }
                ),
            }
        }

        return {
            error: NextResponse.json(
                { success: false, error: 'An error occurred while validating request' },
                { status: 500 }
            ),
        }
    }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
    searchParams: URLSearchParams,
    schema: ZodSchema<T>
): { data: T } | { error: NextResponse } {
    try {
        const params = Object.fromEntries(searchParams)
        const data = schema.parse(params)
        return { data }
    } catch (err) {
        if (err instanceof ZodError) {
            const errors = err.issues.map((e: ZodIssue) => ({
                field: e.path.join('.'),
                message: e.message,
            }))

            return {
                error: NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid query parameters',
                        details: errors
                    },
                    { status: 400 }
                ),
            }
        }

        return {
            error: NextResponse.json(
                { success: false, error: 'An error occurred while validating query' },
                { status: 500 }
            ),
        }
    }
}

/**
 * Check if validation result has an error
 */
export function hasValidationError<T>(
    result: { data: T } | { error: NextResponse }
): result is { error: NextResponse } {
    return 'error' in result
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim()
}

/**
 * Sanitize object with string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj }

    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string)
        }
    }

    return sanitized
}

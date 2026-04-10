// Custom error classes for consistent error handling

export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode = 500,
        isOperational = true
    ) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403)
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409)
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message, 429)
    }
}

/**
 * Handle errors and return appropriate status code and message
 */
export function handleError(err: unknown): { statusCode: number; message: string } {
    if (err instanceof AppError) {
        return { statusCode: err.statusCode, message: err.message }
    }

    if (err instanceof Error) {
        // Prisma unique constraint violation
        if (err.message.includes('Unique constraint')) {
            return { statusCode: 409, message: 'Resource already exists' }
        }
        // Prisma record not found
        if (err.message.includes('Record to update not found') || err.message.includes('Record to delete does not exist')) {
            return { statusCode: 404, message: 'Resource not found' }
        }
        return { statusCode: 500, message: err.message }
    }

    return { statusCode: 500, message: 'An unexpected error occurred' }
}

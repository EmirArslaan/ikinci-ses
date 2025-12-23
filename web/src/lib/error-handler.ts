/**
 * Global Error Handler Utility
 * Provides standardized error responses and logging for API routes
 */

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: unknown;

    constructor(message: string, statusCode: number = 500, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter?: number) {
        super('Too many requests', 429, { retryAfter });
    }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    details?: unknown;
    timestamp?: string;
    path?: string;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
    error: Error | AppError,
    path?: string
): ErrorResponse {
    const isAppError = error instanceof AppError;

    const response: ErrorResponse = {
        error: isAppError ? error.constructor.name : 'InternalServerError',
        message: error.message,
        statusCode: isAppError ? error.statusCode : 500,
        timestamp: new Date().toISOString(),
    };

    if (path) {
        response.path = path;
    }

    if (isAppError && error.details) {
        response.details = error.details;
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && !isAppError) {
        response.message = 'An unexpected error occurred';
    }

    return response;
}

/**
 * Log error with appropriate level
 */
export function logError(error: Error | AppError, context?: Record<string, unknown>) {
    const isAppError = error instanceof AppError;
    const isOperational = isAppError && error.isOperational;

    const logData = {
        timestamp: new Date().toISOString(),
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            statusCode: isAppError ? error.statusCode : 500,
        },
        context,
    };

    // Operational errors (expected) - warn level
    if (isOperational) {
        console.warn('⚠️ Operational Error:', JSON.stringify(logData, null, 2));
    }
    // Programming/system errors (unexpected) - error level
    else {
        console.error('❌ System Error:', JSON.stringify(logData, null, 2));
    }

    // In production, you would send this to a logging service like Sentry
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
}

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 */
export function asyncHandler<T>(
    handler: (req: Request, context?: T) => Promise<Response>
) {
    return async (req: Request, context?: T): Promise<Response> => {
        try {
            return await handler(req, context);
        } catch (error) {
            logError(error as Error, {
                method: req.method,
                url: req.url,
            });

            const errorResponse = formatErrorResponse(
                error as Error,
                new URL(req.url).pathname
            );

            return Response.json(errorResponse, {
                status: errorResponse.statusCode,
            });
        }
    };
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
    req: Request,
    schema: { parse: (data: unknown) => T }
): Promise<T> {
    try {
        const body = await req.json();
        return schema.parse(body);
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            // Zod validation error
            throw new ValidationError('Validation failed', {
                issues: (error as { issues: unknown[] }).issues,
            });
        }
        throw new ValidationError('Invalid request body');
    }
}

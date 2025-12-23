import { z } from 'zod';

/**
 * Validation helper utility for API routes
 */
export class ValidationError extends Error {
    public errors: z.ZodIssue[];
    public statusCode: number;

    constructor(errors: z.ZodIssue[]) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
        this.statusCode = 400;
    }
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<T> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            throw new ValidationError(result.error.issues);
        }

        return result.data;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        if (error instanceof SyntaxError) {
            throw new ValidationError([
                {
                    code: 'custom',
                    path: [],
                    message: 'Geçersiz JSON formatı',
                } as z.ZodIssue,
            ]);
        }
        throw error;
    }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
    searchParams: URLSearchParams,
    schema: z.ZodSchema<T>
): T {
    // Convert URLSearchParams to object
    const queryObject: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        queryObject[key] = value;
    });

    const result = schema.safeParse(queryObject);

    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }

    return result.data;
}

/**
 * Format validation errors to user-friendly response
 */
export function formatValidationErrors(errors: z.ZodIssue[]): {
    field: string;
    message: string;
}[] {
    return errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
    }));
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(error: ValidationError) {
    return Response.json(
        {
            error: 'Validation failed',
            details: formatValidationErrors(error.errors),
        },
        { status: error.statusCode }
    );
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate Turkish phone number
 */
export function isValidTurkishPhone(phone: string): boolean {
    return /^(\+90|0)?5\d{9}$/.test(phone);
}

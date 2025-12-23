# Error Handling Guide

This document explains how to use the error handling infrastructure in the İkinci Ses application.

## Overview

The application uses a comprehensive error handling system with:
- **Custom error classes** for different error types
- **Standardized error responses** for consistency
- **React Error Boundaries** for UI error handling
- **Structured logging** for debugging

---

## Custom Error Classes

Import from `@/lib/error-handler`:

```typescript
import {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
} from '@/lib/error-handler';
```

### Usage Examples

```typescript
// Not Found
throw new NotFoundError('Listing');
// Response: 404 "Listing not found"

// Validation Error
throw new ValidationError('Invalid email format', { field: 'email' });
// Response: 400 with details

// Authentication Error
throw new AuthenticationError();
// Response: 401 "Authentication required"

// Authorization Error
throw new AuthorizationError();
// Response: 403 "Insufficient permissions"

// Conflict Error
throw new ConflictError('Email already exists');
// Response: 409

// Rate Limit Error
throw new RateLimitError(900); // retryAfter in seconds
// Response: 429
```

---

## API Route Error Handling

### Option 1: Using `asyncHandler` (Recommended)

Wrap your route handler with `asyncHandler` to automatically catch and format errors:

```typescript
import { asyncHandler, NotFoundError } from '@/lib/error-handler';

export const GET = asyncHandler(async (req) => {
    const listing = await prisma.listing.findUnique({
        where: { id: params.id }
    });
    
    if (!listing) {
        throw new NotFoundError('Listing');
    }
    
    return Response.json(listing);
});
```

### Option 2: Manual try-catch

```typescript
import { formatErrorResponse, logError } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
    try {
        // Your logic here
        const data = await fetchData();
        return Response.json(data);
    } catch (error) {
        logError(error as Error, {
            method: req.method,
            url: req.url,
        });
        
        const errorResponse = formatErrorResponse(error as Error);
        return Response.json(errorResponse, {
            status: errorResponse.statusCode
        });
    }
}
```

---

## Request Validation

Use `validateRequest` helper with Zod schemas:

```typescript
import { validateRequest, ValidationError } from '@/lib/error-handler';
import { createListingSchema } from '@/lib/validations/listing.validation';

export const POST = asyncHandler(async (req) => {
    // Automatically throws ValidationError if invalid
    const data = await validateRequest(req, createListingSchema);
    
    const listing = await prisma.listing.create({ data });
    return Response.json(listing, { status: 201 });
});
```

---

## React Error Boundaries

The `ErrorBoundary` component is already wrapping the entire application in `layout.tsx`.

### Custom Error Boundary

For specific sections, you can add additional boundaries:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function MyPage() {
    return (
        <ErrorBoundary 
            fallback={<CustomErrorUI />}
            onError={(error, errorInfo) => {
                // Custom error handling
                console.log('Custom handler', error);
            }}
        >
            <YourComponentThatMightFail />
        </ErrorBoundary>
    );
}
```

### Custom Fallback UI

```typescript
const customFallback = (
    <div className="p-8 text-center">
        <h2>Oops! Something went wrong</h2>
        <button onClick={() => window.location.reload()}>
            Try Again
        </button>
    </div>
);

<ErrorBoundary fallback={customFallback}>
    <YourComponent />
</ErrorBoundary>
```

---

## Error Response Format

All API errors return this standardized format:

```json
{
    "error": "NotFoundError",
    "message": "Listing not found",
    "statusCode": 404,
    "timestamp": "2025-12-23T07:45:23.123Z",
    "path": "/api/listings/123",
    "details": { }
}
```

### HTTP Status Codes

| Error Type | Status Code |
|------------|-------------|
| `ValidationError` | 400 |
| `AuthenticationError` | 401 |
| `AuthorizationError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `RateLimitError` | 429 |
| `AppError` (generic) | 500 |

---

## Logging

Errors are automatically logged with appropriate levels:

```typescript
import { logError } from '@/lib/error-handler';

// Log with context
logError(error, {
    userId: user.id,
    action: 'create_listing',
    listingId: listing.id,
});
```

### Log Levels

- **Operational Errors** (expected): `console.warn` ⚠️
  - ValidationError, NotFoundError, AuthenticationError, etc.
  
- **System Errors** (unexpected): `console.error` ❌
  - Database errors, programming errors, etc.

### Production Logging

In production, integrate with a logging service:

```typescript
// src/lib/error-handler.ts
if (process.env.NODE_ENV === 'production') {
    // Example: Sentry
    // Sentry.captureException(error, { contexts: { custom: context } });
    
    // Example: LogRocket
    // LogRocket.captureException(error, { extra: context });
}
```

---

## Best Practices

### ✅ DO

- Use specific error classes (`NotFoundError` instead of generic `AppError`)
- Include context when logging errors
- Provide helpful error messages to users
- Use `asyncHandler` for consistent error handling
- Validate input with Zod schemas

### ❌ DON'T

- Expose internal error details in production
- Catch errors without logging them
- Return inconsistent error formats
- Use generic error messages like "Error occurred"

---

## Examples

### Complete API Route Example

```typescript
import { NextRequest } from 'next/server';
import { asyncHandler, NotFoundError, AuthenticationError } from '@/lib/error-handler';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
    // Authentication
    const payload = getUserFromRequest(req);
    if (!payload) {
        throw new AuthenticationError();
    }
    
    // Fetch data
    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
        include: { user: true, category: true }
    });
    
    // Validation
    if (!listing) {
        throw new NotFoundError('Listing');
    }
    
    // Authorization
    if (listing.userId !== payload.userId && payload.role !== 'ADMIN') {
        throw new AuthorizationError('You can only view your own listings');
    }
    
    return Response.json(listing);
});
```

### Frontend Error Handling

```typescript
async function createListing(data: ListingData) {
    try {
        const response = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const error = await response.json();
            // error.message, error.statusCode, error.details available
            throw new Error(error.message);
        }
        
        return await response.json();
    } catch (error) {
        // Handle error in UI
        toast.error(error.message);
        throw error;
    }
}
```

---

## Migration Guide

To update existing API routes to use the new error handling:

**Before:**
```typescript
export async function GET(req: NextRequest) {
    try {
        const data = await fetchData();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
```

**After:**
```typescript
import { asyncHandler, NotFoundError } from '@/lib/error-handler';

export const GET = asyncHandler(async (req) => {
    const data = await fetchData();
    if (!data) {
        throw new NotFoundError('Data');
    }
    return Response.json(data);
});
```

---

## Testing

```typescript
// Test error responses
it('should return 404 for non-existent listing', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('NotFoundError');
    expect(data.message).toContain('not found');
});
```

/**
 * Cache Utilities
 * Helper functions for managing cache headers and strategies
 */

export type CacheStrategy = 'static' | 'dynamic' | 'revalidate' | 'no-cache';

export interface CacheOptions {
    maxAge?: number; // seconds
    swr?: number; // stale-while-revalidate seconds
    revalidate?: number; // Next.js revalidation seconds
    strategy?: CacheStrategy;
}

/**
 * Generate Cache-Control header value
 */
export function getCacheControl(options: CacheOptions = {}): string {
    const {
        maxAge = 60,
        swr = 300,
        strategy = 'revalidate',
    } = options;

    switch (strategy) {
        case 'static':
            // Long cache for static content (1 year)
            return 'public, max-age=31536000, immutable';

        case 'dynamic':
            // No cache for dynamic content
            return 'private, no-cache, no-store, must-revalidate';

        case 'revalidate':
            // Cache with revalidation (stale-while-revalidate)
            return `public, max-age=${maxAge}, stale-while-revalidate=${swr}`;

        case 'no-cache':
            return 'no-cache, no-store, max-age=0, must-revalidate';

        default:
            return `public, max-age=${maxAge}`;
    }
}

/**
 * Common cache durations (in seconds)
 */
export const CACHE_DURATION = {
    NONE: 0,
    SHORT: 60,          // 1 minute
    MEDIUM: 300,        // 5 minutes
    LONG: 3600,         // 1 hour
    DAY: 86400,         // 24 hours
    WEEK: 604800,       // 7 days
    MONTH: 2592000,     // 30 days
    YEAR: 31536000,     // 365 days
} as const;

/**
 * Cache configurations for different content types
 */
export const CACHE_CONFIG = {
    // Static assets (images, fonts, etc.)
    STATIC: {
        maxAge: CACHE_DURATION.YEAR,
        strategy: 'static' as const,
    },

    // Listing data (changes occasionally)
    LISTING: {
        maxAge: CACHE_DURATION.SHORT,
        swr: CACHE_DURATION.MEDIUM,
        strategy: 'revalidate' as const,
        revalidate: CACHE_DURATION.MEDIUM,
    },

    // Category/Brand data (rarely changes)
    METADATA: {
        maxAge: CACHE_DURATION.LONG,
        swr: CACHE_DURATION.DAY,
        strategy: 'revalidate' as const,
        revalidate: CACHE_DURATION.DAY,
    },

    // User data (changes frequently)
    USER: {
        maxAge: CACHE_DURATION.SHORT,
        swr: CACHE_DURATION.SHORT,
        strategy: 'revalidate' as const,
        revalidate: CACHE_DURATION.SHORT,
    },

    // Search results (dynamic)
    SEARCH: {
        maxAge: CACHE_DURATION.SHORT,
        strategy: 'revalidate' as const,
    },

    // No cache for sensitive data
    PRIVATE: {
        strategy: 'no-cache' as const,
    },
} as const;

/**
 * Create cache headers for Response
 */
export function createCacheHeaders(options: CacheOptions = {}): HeadersInit {
    return {
        'Cache-Control': getCacheControl(options),
        'CDN-Cache-Control': getCacheControl({ ...options, swr: 0 }), // Cloudflare
        'Vercel-CDN-Cache-Control': getCacheControl({ ...options, swr: 0 }), // Vercel
    };
}

/**
 * Create cached response
 */
export function createCachedResponse(
    data: unknown,
    options: CacheOptions = {}
): Response {
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
            ...createCacheHeaders(options),
        },
    });
}

/**
 * Generate ETag for content
 */
export function generateETag(content: string): string {
    // Simple hash function for ETag
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `"${Math.abs(hash).toString(36)}"`;
}

/**
 * Check if request has matching ETag
 */
export function hasMatchingETag(request: Request, etag: string): boolean {
    const ifNoneMatch = request.headers.get('If-None-Match');
    return ifNoneMatch === etag;
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(etag: string): Response {
    return new Response(null, {
        status: 304,
        headers: {
            'ETag': etag,
            'Cache-Control': 'public, max-age=60',
        },
    });
}

/**
 * Next.js revalidation tag helper
 */
export const REVALIDATE_TAGS = {
    LISTINGS: 'listings',
    LISTING: (id: string) => `listing:${id}`,
    CATEGORIES: 'categories',
    BRANDS: 'brands',
    USER: (id: string) => `user:${id}`,
    QUESTIONS: 'questions',
    MEETUPS: 'meetups',
} as const;

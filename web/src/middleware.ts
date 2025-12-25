import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Rate limit configuration
const RATE_LIMITS = {
    // API endpoints
    '/api/auth/login': { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 min
    '/api/auth/register': { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    '/api/auth/send-verification': { max: 3, window: 15 * 60 * 1000 }, // 3 per 15 min
    '/api/': { max: 100, window: 60 * 1000 }, // 100 requests per minute (general)
};

function getRateLimitConfig(pathname: string) {
    // Check for specific endpoint limits first
    for (const [path, config] of Object.entries(RATE_LIMITS)) {
        if (pathname.startsWith(path)) {
            return config;
        }
    }
    return null;
}

function getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';

    return ip;
}

function checkRateLimit(identifier: string, pathname: string): { allowed: boolean; remaining: number; resetTime: number } {
    const config = getRateLimitConfig(pathname);

    if (!config) {
        return { allowed: true, remaining: 999, resetTime: Date.now() };
    }

    const key = `${identifier}:${pathname}`;
    const now = Date.now();
    const limitData = rateLimitStore.get(key);

    if (!limitData || now > limitData.resetTime) {
        // Create new limit window
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.window
        });
        return { allowed: true, remaining: config.max - 1, resetTime: now + config.window };
    }

    if (limitData.count >= config.max) {
        return { allowed: false, remaining: 0, resetTime: limitData.resetTime };
    }

    // Increment count
    limitData.count++;
    rateLimitStore.set(key, limitData);

    return { allowed: true, remaining: config.max - limitData.count, resetTime: limitData.resetTime };
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // CORS Headers
    const response = NextResponse.next();

    // Allow specific origins (customize for your domain)
    const origin = request.headers.get('origin');
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_SOCKET_URL,
    ].filter(Boolean) as string[];

    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            'X-Requested-With, Content-Type, Authorization, Accept, Origin'
        );
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    // Rate limiting for API routes only
    if (pathname.startsWith('/api/')) {
        const identifier = getClientIdentifier(request);
        const rateLimit = checkRateLimit(identifier, pathname);

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', getRateLimitConfig(pathname)?.max.toString() || '100');
        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

        if (!rateLimit.allowed) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
                        ...Object.fromEntries(response.headers.entries())
                    }
                }
            );
        }
    }

    return response;
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

# Caching Strategy Guide

Complete guide for implementing caching to achieve maximum performance in the İkinci Ses application.

---

## Overview

The caching system uses multiple layers:
- **Next.js ISR** - Incremental Static Regeneration
- **API Response Caching** - HTTP Cache-Control headers
- **CDN Caching** - Vercel/Cloudflare edge caching
- **Conditional Requests** - ETags for 304 responses

---

## Cache Utilities

### Basic Usage

```typescript
import { createCachedResponse, CACHE_CONFIG } from '@/lib/cache';

export async function GET() {
    const data = await fetchData();
    
    // Return with cache headers
    return createCachedResponse(data, CACHE_CONFIG.LISTING);
}
```

### Cache Configurations

Pre-configured cache strategies for different content:

```typescript
CACHE_CONFIG.STATIC      // 1 year (images, fonts)
CACHE_CONFIG.METADATA    // 1 hour + 1 day SWR (categories, brands)
CACHE_CONFIG.LISTING     // 1 minute + 5 minutes SWR
CACHE_CONFIG.USER        // 1 minute + 1 minute SWR
CACHE_CONFIG.SEARCH      // 1 minute (dynamic)
CACHE_CONFIG.PRIVATE     // No cache (auth, sensitive)
```

---

## Next.js ISR (Incremental Static Regeneration)

### Static Pages with Revalidation

```typescript
// app/categories/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function CategoryPage({ params }) {
    const listings = await fetchListings(params.slug);
    return <ListingGrid listings={listings} />;
}
```

**Benefits:**
- Static generation (fast)
- Auto-updates every hour
- No stale data

### Dynamic Page with ISR

```typescript
// app/listings/[id]/page.tsx
export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
    // Generate for popular listings
    const listings = await prisma.listing.findMany({
        take: 100,
        orderBy: { viewCount: 'desc' },
    });
    
    return listings.map(l => ({ id: l.id }));
}

export default async function ListingPage({ params }) {
    const listing = await fetchListing(params.id);
    return <ListingDetail listing={listing} />;
}
```

---

## API Route Caching

### Example: Categories API (Rarely Changes)

```typescript
// app/api/categories/route.ts
import { createCachedResponse, CACHE_CONFIG } from '@/lib/cache';

export async function GET() {
    const categories = await prisma.category.findMany();
    
    // Cache for 1 hour with 1 day SWR
    return createCachedResponse(categories, CACHE_CONFIG.METADATA);
}

export const revalidate = 3600; // ISR: 1 hour
```

### Example: Listings API (Changes Frequently)

```typescript
// app/api/listings/route.ts
export async function GET(request: NextRequest) {
    const listings = await prisma.listing.findMany({
        where: { isActive: true },
        take: 20,
    });
    
    // Short cache with SWR
    return createCachedResponse(listings, CACHE_CONFIG.LISTING);
}

export const revalidate = 60; // ISR: 1 minute
```

### Example: User Profile (Private Data)

```typescript
// app/api/user/profile/route.ts
export async function GET(request: NextRequest) {
    const user = getUserFromRequest(request);
    const profile = await fetchUserProfile(user.id);
    
    // No cache for private data
    return createCachedResponse(profile, CACHE_CONFIG.PRIVATE);
}
```

---

## Advanced: ETag Support

For optimal bandwidth usage with conditional requests:

```typescript
import { generateETag, hasMatchingETag, createNotModifiedResponse } from '@/lib/cache';

export async function GET(request: NextRequest) {
    const data = await fetchData();
    const content = JSON.stringify(data);
    const etag = generateETag(content);
    
    // Check if client has current version
    if (hasMatchingETag(request, etag)) {
        return createNotModifiedResponse(etag);
    }
    
    // Return full response with ETag
    return new Response(content, {
        headers: {
            'Content-Type': 'application/json',
            'ETag': etag,
            'Cache-Control': 'public, max-age=60',
        },
    });
}
```

**Benefit:** Saves bandwidth on unchanged data (304 responses)

---

## Cache Durations

Use pre-defined durations:

```typescript
import { CACHE_DURATION } from '@/lib/cache';

CACHE_DURATION.NONE      // 0 seconds
CACHE_DURATION.SHORT     // 1 minute
CACHE_DURATION.MEDIUM    // 5 minutes
CACHE_DURATION.LONG      // 1 hour
CACHE_DURATION.DAY       // 24 hours
CACHE_DURATION.WEEK      // 7 days
CACHE_DURATION.MONTH     // 30 days
CACHE_DURATION.YEAR      // 365 days
```

---

## Cache Invalidation

### On-Demand Revalidation

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
export async function POST() {
    await createListing();
    revalidatePath('/listings');
    return Response.json({ success: true });
}

// Revalidate by tag
export async function PUT() {
    await updateListing(id);
    revalidateTag(`listing:${id}`);
    return Response.json({ success: true });
}
```

### Cache Tags

```typescript
import { REVALIDATE_TAGS } from '@/lib/cache';

// In API route
export const dynamic = 'force-dynamic';
export const revalidate = 60;
export const tags = [REVALIDATE_TAGS.LISTINGS];

// Invalidate
revalidateTag(REVALIDATE_TAGS.LISTINGS);
revalidateTag(REVALIDATE_TAGS.LISTING('123'));
```

---

## Best Practices

### 1. Choose Appropriate Cache Duration

```typescript
// ✅ Good: Static metadata
createCachedResponse(categories, CACHE_CONFIG.METADATA); // 1 hour

// ✅ Good: Dynamic listings
createCachedResponse(listings, CACHE_CONFIG.LISTING); // 1 minute

// ❌ Bad: Long cache for frequently changing data
createCachedResponse(listings, { maxAge: 86400 }); // Too long!
```

### 2. Use ISR for Static Content

```typescript
// ✅ Good: Category pages (rarely change)
export const revalidate = 3600; // 1 hour

// ✅ Good: Listing details (moderate changes)
export const revalidate = 300; // 5 minutes

// ❌ Bad: Real-time data with ISR
export const revalidate = 1; // Use dynamic instead!
```

### 3. Combine Strategies

```typescript
// Perfect combination
export const revalidate = 300; // ISR every 5 minutes

export async function GET() {
    const data = await fetchData();
    
    // ALSO add cache headers for CDN
    return createCachedResponse(data, {
        maxAge: 60,
        swr: 300,
    });
}
```

---

## Performance Impact

### Before Caching:
- Every request hits database
- Avg response time: 200-500ms
- Server load: High
- Bandwidth: High

### After Caching:
- Most requests served from cache
- Avg response time: 10-50ms
- Server load: Low
- Bandwidth: Reduced by 70-90%

### Example Metrics:

**Categories API:**
- Without cache: 250ms
- With cache (hit): 15ms
- **Improvement: 94% faster**

**Listings Page:**
- Without ISR: 800ms
- With ISR: 50ms
- **Improvement: 94% faster**

---

## Testing

### Test Cache Headers

```bash
# Check cache headers
curl -I https://ikincises.com/api/categories

# Expected:
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### Test ETag

```bash
# First request
curl -i https://ikincises.com/api/listings
# Note the ETag: "abc123"

# Second request with ETag
curl -i -H 'If-None-Match: "abc123"' https://ikincises.com/api/listings
# Expected: 304 Not Modified
```

---

## Migration Guide

### Add Caching to Existing API

**Before:**
```typescript
export async function GET() {
    const data = await fetchData();
    return NextResponse.json(data);
}
```

**After:**
```typescript
import { createCachedResponse, CACHE_CONFIG } from '@/lib/cache';

export async function GET() {
    const data = await fetchData();
    return createCachedResponse(data, CACHE_CONFIG.LISTING);
}

export const revalidate = 300; // ISR
```

---

## Production Checklist

- [ ] All API routes have cache headers
- [ ] Static pages use ISR
- [ ] Appropriate cache durations set
- [ ] Cache invalidation working
- [ ] ETags implemented for large responses
- [ ] CDN caching configured
- [ ] Monitor cache hit rates

---

## Next Steps

1. **Add caching to all API routes**
2. **Enable ISR on static pages**
3. **Monitor cache performance**
4. **Adjust durations based on usage**
5. **Set up cache analytics**

---

## Resources

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [HTTP Caching](https://web.dev/http-cache/)
- [Vercel Edge](https://vercel.com/docs/edge-network/caching)

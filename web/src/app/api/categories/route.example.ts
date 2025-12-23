import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCachedResponse, CACHE_CONFIG } from '@/lib/cache';

/**
 * GET /api/categories
 * 
 * Fetch all categories
 * Cached for 1 hour (rarely changes)
 */
export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
            },
        });

        // Return cached response
        return createCachedResponse(categories, CACHE_CONFIG.METADATA);
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Kategoriler alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

// Enable ISR - regenerate every hour
export const revalidate = 3600; // 1 hour

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Sitemap XML Generator
 * GET /api/sitemap
 * 
 * Generates dynamic sitemap with all public URLs
 */
export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Fetch all approved listings
        const listings = await prisma.listing.findMany({
            where: {
                isActive: true,
                // approvalStatus: 'APPROVED', // Uncomment when schema is updated
            },
            select: {
                id: true,
                updatedAt: true,
            },
            take: 50000, // Sitemap limit
        });

        // Fetch all categories
        const categories = await prisma.category.findMany({
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        // Static pages
        const staticPages = [
            { url: '', priority: 1.0, changefreq: 'daily' },
            { url: '/listings', priority: 0.9, changefreq: 'hourly' },
            { url: '/questions', priority: 0.8, changefreq: 'daily' },
            { url: '/meetups', priority: 0.8, changefreq: 'daily' },
            { url: '/auth/login', priority: 0.5, changefreq: 'monthly' },
            { url: '/auth/register', priority: 0.5, changefreq: 'monthly' },
        ];

        // Build sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
${categories.map(category => `  <url>
    <loc>${baseUrl}/listings?category=${category.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${category.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
${listings.map(listing => `  <url>
    <loc>${baseUrl}/listings/${listing.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${listing.updatedAt.toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}

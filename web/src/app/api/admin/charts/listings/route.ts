import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/charts/listings
 * Get listings chart data (last 7 or 30 days)
 */
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7days';

        const days = period === '30days' ? 30 : 7;

        // Generate date range
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            date.setHours(0, 0, 0, 0);
            return date;
        });

        // Get listing counts for each day
        const chartData = await Promise.all(
            dateRange.map(async (date) => {
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);

                const count = await prisma.listing.count({
                    where: {
                        createdAt: {
                            gte: date,
                            lt: nextDay
                        }
                    }
                });

                return { date, count };
            })
        );

        // Format for Chart.js
        const labels = chartData.map(item => {
            const month = item.date.toLocaleDateString('tr-TR', { month: 'short' });
            const day = item.date.getDate();
            return `${day} ${month}`;
        });

        const data = chartData.map(item => item.count);

        return NextResponse.json({
            labels,
            data
        });

    } catch (error) {
        console.error('Admin listings chart error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}

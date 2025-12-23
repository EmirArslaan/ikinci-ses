import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/charts/revenue
 * Get revenue chart data (last 30 days)
 */
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const days = 30;

        // Generate date range
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            date.setHours(0, 0, 0, 0);
            return date;
        });

        // Get revenue for each day
        const chartData = await Promise.all(
            dateRange.map(async (date) => {
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);

                const result = await prisma.payment.aggregate({
                    where: {
                        status: 'COMPLETED',
                        createdAt: {
                            gte: date,
                            lt: nextDay
                        }
                    },
                    _sum: {
                        amount: true
                    }
                });

                return {
                    date,
                    amount: result._sum.amount || 0
                };
            })
        );

        // Format for Chart.js
        const labels = chartData.map(item => {
            const month = item.date.toLocaleDateString('tr-TR', { month: 'short' });
            const day = item.date.getDate();
            return `${day} ${month}`;
        });

        const data = chartData.map(item => item.amount);

        return NextResponse.json({
            labels,
            data
        });

    } catch (error) {
        console.error('Admin revenue chart error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}

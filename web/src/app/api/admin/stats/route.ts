import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get all statistics in parallel
        const [
            totalUsers,
            totalListings,
            activeListings,
            pendingListings,
            totalQuestions,
            pendingQuestions,
            totalMeetups,
            pendingMeetups,
            paymentStats,
            recentUsers
        ] = await Promise.all([
            // Users
            prisma.user.count(),

            // Listings
            prisma.listing.count(),
            prisma.listing.count({
                where: { isActive: true, approvalStatus: 'APPROVED' }
            }),
            prisma.listing.count({
                where: { approvalStatus: 'PENDING' }
            }),

            // Questions
            prisma.question.count(),
            prisma.question.count({
                where: { approvalStatus: 'PENDING' }
            }),

            // Meetups
            prisma.meetup.count(),
            prisma.meetup.count({
                where: { approvalStatus: 'PENDING' }
            }),

            // Payments
            prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
                _count: true
            }),

            // Recent users for trend (last 7 days)
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        // Calculate user growth percentage (comparing to last week)
        const userGrowth = totalUsers > 0
            ? ((recentUsers / totalUsers) * 100).toFixed(1)
            : '0';

        return NextResponse.json({
            users: {
                total: totalUsers,
                change: `+${userGrowth}%`,
                recent: recentUsers
            },
            listings: {
                total: totalListings,
                active: activeListings,
                pending: pendingListings
            },
            questions: {
                total: totalQuestions,
                pending: pendingQuestions
            },
            meetups: {
                total: totalMeetups,
                pending: pendingMeetups
            },
            payments: {
                total: paymentStats._sum.amount || 0,
                count: paymentStats._count || 0,
                currency: 'TRY'
            },
            pending: {
                total: pendingListings + pendingQuestions + pendingMeetups,
                listings: pendingListings,
                questions: pendingQuestions,
                meetups: pendingMeetups
            }
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}

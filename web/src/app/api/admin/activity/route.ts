import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/activity
 * Get recent activity feed
 */
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const limit = 20;

        // Fetch recent activities from different sources
        const [recentUsers, recentListings, recentPayments, recentQuestions] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, name: true, email: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.listing.findMany({
                select: { id: true, title: true, createdAt: true, user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.payment.findMany({
                select: { id: true, amount: true, createdAt: true, user: { select: { name: true } } },
                where: { status: 'COMPLETED' },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.question.findMany({
                select: { id: true, title: true, createdAt: true, user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        // Combine and format activities
        const activities = [
            ...recentUsers.map(user => ({
                id: `user-${user.id}`,
                type: 'USER_REGISTERED',
                title: `${user.name} kayıt oldu`,
                subtitle: user.email,
                timestamp: user.createdAt,
                icon: 'person_add',
                color: 'blue'
            })),
            ...recentListings.map(listing => ({
                id: `listing-${listing.id}`,
                type: 'LISTING_CREATED',
                title: `Yeni ilan: ${listing.title}`,
                subtitle: `${listing.user.name} tarafından`,
                timestamp: listing.createdAt,
                icon: 'inventory_2',
                color: 'green'
            })),
            ...recentPayments.map(payment => ({
                id: `payment-${payment.id}`,
                type: 'PAYMENT_COMPLETED',
                title: `${payment.amount} TL ödeme alındı`,
                subtitle: `${payment.user.name} tarafından`,
                timestamp: payment.createdAt,
                icon: 'payments',
                color: 'purple'
            })),
            ...recentQuestions.map(question => ({
                id: `question-${question.id}`,
                type: 'QUESTION_ASKED',
                title: `Yeni soru: ${question.title}`,
                subtitle: `${question.user.name} tarafından`,
                timestamp: question.createdAt,
                icon: 'help',
                color: 'orange'
            }))
        ];

        // Sort by timestamp and limit
        activities.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({
            activities: activities.slice(0, limit)
        });

    } catch (error) {
        console.error('Admin activity error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}

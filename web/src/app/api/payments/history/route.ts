import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/history
 * Get payment history for current user
 */
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payments = await prisma.payment.findMany({
            where: { userId: payload.userId },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        images: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ payments });

    } catch (error) {
        console.error('Get payment history error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}

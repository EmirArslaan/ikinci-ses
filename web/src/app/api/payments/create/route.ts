import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createPayment, generateMerchantOid, calculatePromotionCost } from '@/lib/payment';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/create
 * Create a payment for listing promotions
 */
export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId, promotions } = await request.json();

        // Validate input
        if (!listingId || !promotions || !Array.isArray(promotions) || promotions.length === 0) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Verify listing ownership
        const listing = await prisma.listing.findUnique({
            where: { id: listingId }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.userId !== payload.userId) {
            return NextResponse.json({ error: 'Not your listing' }, { status: 403 });
        }

        // Calculate total amount
        const totalAmount = calculatePromotionCost(promotions);

        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'Invalid promotion selection' }, { status: 400 });
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate unique merchant order ID
        const merchantOid = generateMerchantOid();

        // Create payment record in database
        const payment = await prisma.payment.create({
            data: {
                userId: payload.userId,
                listingId,
                amount: totalAmount,
                status: 'PENDING',
                provider: 'paytr',
                merchantOid,
                promotionType: promotions[0].type,
                promotionWeeks: promotions[0].weeks,
                description: `Promosyon: ${promotions.map((p: any) => p.type).join(', ')}`,
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
                userAgent: request.headers.get('user-agent') || '',
            }
        });

        // Create PayTR payment token
        const paymentResult = await createPayment({
            userId: payload.userId,
            amount: totalAmount,
            description: payment.description!,
            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone || '05551234567',
            userAddress: 'Türkiye', // TODO: Get real address if available
            merchantOid,
            itemId: payment.id
        });

        if (paymentResult.success) {
            // Update payment with token
            await prisma.payment.update({
                where: { id: payment.id },
                data: { paymentToken: paymentResult.token }
            });

            return NextResponse.json({
                success: true,
                paymentId: payment.id,
                iframeUrl: paymentResult.iframeUrl,
                amount: totalAmount
            }, { status: 201 });
        }

        return NextResponse.json(
            { error: paymentResult.error || 'Payment creation failed' },
            { status: 500 }
        );

    } catch (error) {
        console.error('Create payment error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}

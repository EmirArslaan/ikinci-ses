import { NextRequest, NextResponse } from 'next/server';
import { verifyPayTRCallback } from '@/lib/payment';
import { applyPromotionsToListing } from '@/lib/promotions';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/callback
 * PayTR webhook handler
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const merchantOid = formData.get('merchant_oid') as string;
        const status = formData.get('status') as string;
        const totalAmount = formData.get('total_amount') as string;
        const hash = formData.get('hash') as string;

        // Verify hash to ensure request is from PayTR
        if (!verifyPayTRCallback(merchantOid, status, totalAmount, hash)) {
            console.error('⚠️  Invalid PayTR callback hash');
            return new Response('OK', { status: 200 }); // PayTR expects 200 even on error
        }

        // Find payment by merchantOid
        const payment = await prisma.payment.findFirst({
            where: { merchantOid }
        });

        if (!payment) {
            console.error(`⚠️  Payment not found for merchantOid: ${merchantOid}`);
            return new Response('OK', { status: 200 });
        }

        if (status === 'success') {
            // Payment successful
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    transactionId: merchantOid
                }
            });

            // Apply promotions to listing
            if (payment.listingId && payment.promotionType) {
                await applyPromotionsToListing(
                    payment.listingId,
                    [{ type: payment.promotionType, weeks: payment.promotionWeeks! }]
                );
            }

            console.log(`✅ Payment ${payment.id} completed successfully`);
        } else {
            // Payment failed
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });

            console.log(`❌ Payment ${payment.id} failed`);
        }

        // PayTR expects 'OK' response
        return new Response('OK', { status: 200 });

    } catch (error) {
        console.error('Payment callback error:', error);
        // Still return OK to PayTR
        return new Response('OK', { status: 200 });
    }
}

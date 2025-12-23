import crypto from 'crypto';

/**
 * Payment Service - PayTR Integration
 * PayTR API: https://www.paytr.com/odeme/api
 */

export interface PaymentRequest {
    userId: string;
    amount: number;
    description: string;
    userEmail: string;
    userName: string;
    userPhone: string;
    userAddress: string;
    merchantOid: string;
    itemId?: string;
}

export interface PaymentResponse {
    success: boolean;
    token?: string;
    iframeUrl?: string;
    error?: string;
}

export async function createPayment(req: PaymentRequest): Promise<PaymentResponse> {
    // Check if PayTR is configured
    if (!process.env.PAYTR_MERCHANT_ID || !process.env.PAYTR_MERCHANT_KEY || !process.env.PAYTR_MERCHANT_SALT) {
        console.warn('⚠️  PayTR credentials not configured. Running in DEMO mode.');
        console.log(`💳 Demo payment for ${req.userEmail}:`);
        console.log(`   Amount: ${req.amount} TL`);
        console.log(`   Description: ${req.description}`);
        console.log(`   ✅ Payment created (demo mode)\n`);

        return {
            success: true,
            token: 'demo_token_' + Date.now(),
            iframeUrl: '/demo-payment?amount=' + req.amount
        };
    }

    try {
        const merchantId = process.env.PAYTR_MERCHANT_ID!;
        const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

        const userIp = '127.0.0.1'; // Should get from request in production

        // PayTR hash calculation
        const hashStr = `${merchantId}${userIp}${req.merchantOid}${req.userEmail}${req.amount}${req.userPhone}${merchantSalt}`;
        const paytrToken = crypto
            .createHmac('sha256', merchantKey)
            .update(hashStr)
            .digest('base64');

        // User basket (required by PayTR)
        const userBasket = JSON.stringify([[req.description, req.amount.toFixed(2), 1]]);

        // Create payment iframe token
        const params = new URLSearchParams({
            merchant_id: merchantId,
            user_ip: userIp,
            merchant_oid: req.merchantOid,
            email: req.userEmail,
            payment_amount: Math.round(req.amount * 100).toString(), // Convert to kuruş (cents)
            paytr_token: paytrToken,
            user_basket: userBasket,
            debug_on: '1',
            no_installment: '0',
            max_installment: '0',
            user_name: req.userName,
            user_address: req.userAddress,
            user_phone: req.userPhone,
            merchant_ok_url: process.env.PAYTR_OK_URL || 'http://localhost:3000/payments/success',
            merchant_fail_url: process.env.PAYTR_FAIL_URL || 'http://localhost:3000/payments/fail',
            timeout_limit: '30',
            currency: 'TL',
            test_mode: process.env.NODE_ENV === 'development' ? '1' : '0',
            lang: 'tr',
        });

        const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        const data = await response.json();

        if (data.status === 'success') {
            console.log(`✅ PayTR payment token created for ${req.merchantOid}`);
            return {
                success: true,
                token: data.token,
                iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`
            };
        }

        console.error('❌ PayTR error:', data.reason);
        return { success: false, error: data.reason };
    } catch (error) {
        console.error('❌ Payment creation error:', error);
        return { success: false, error: 'Payment creation failed' };
    }
}

export function verifyPayTRCallback(
    merchantOid: string,
    status: string,
    totalAmount: string,
    hash: string
): boolean {
    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
    const calculatedHash = crypto
        .createHmac('sha256', merchantKey)
        .update(hashStr)
        .digest('base64');

    return hash === calculatedHash;
}

export function generateMerchantOid(): string {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Calculate promotion cost based on type and weeks
 */
export function calculatePromotionCost(promotions: Array<{ type: string; weeks: number }>): number {
    const prices = {
        FEATURED: 50,  // 50 TL per week
        PRIORITY: 30,  // 30 TL per week
        URGENT: 20,    // 20 TL per week
    };

    let total = 0;
    for (const promo of promotions) {
        const weeklyPrice = prices[promo.type as keyof typeof prices] || 0;
        total += weeklyPrice * promo.weeks;
    }

    return total;
}

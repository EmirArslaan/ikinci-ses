// SMS Service - Demo Mode
// In production, replace with actual SMS provider (Twilio, Netgsm, etc.)

export async function sendSMS(phone: string, message: string): Promise<boolean> {
    // Demo mode: just log to console
    console.log(`\n📱 SMS to ${phone}:`);
    console.log(`   Message: ${message}`);
    console.log(`   ✅ SMS sent (demo mode)\n`);

    // In production, implement actual SMS sending here
    // Example with Twilio:
    // const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: message,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phone,
    // });

    return true;
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Ensure it starts with country code for Turkey
    if (cleaned.startsWith('0')) {
        cleaned = '90' + cleaned.substring(1);
    } else if (!cleaned.startsWith('90') && cleaned.length === 10) {
        cleaned = '90' + cleaned;
    }

    return '+' + cleaned;
}

export function validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Turkish phone number: 10 digits starting with 5, or 12 digits with 90 prefix
    return (cleaned.length === 10 && cleaned.startsWith('5')) ||
        (cleaned.length === 12 && cleaned.startsWith('905'));
}

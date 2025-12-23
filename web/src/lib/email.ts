import nodemailer from 'nodemailer';
import { getVerificationEmailTemplate, getWelcomeEmailTemplate, getNotificationEmailTemplate } from './email-templates';

/**
 * Email Service - Nodemailer with Gmail SMTP
 * Completely FREE - No external service fees
 * Limit: 500 emails/day with Gmail
 */

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (transporter) return transporter;

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('⚠️  Gmail SMTP not configured. Running in DEMO mode.');
        console.warn('   To enable real emails:');
        console.warn('   1. Create a Gmail account');
        console.warn('   2. Enable 2-Step Verification');
        console.warn('   3. Generate App Password: https://myaccount.google.com/apppasswords');
        console.warn('   4. Add to .env: GMAIL_USER=your@gmail.com');
        console.warn('   5. Add to .env: GMAIL_APP_PASSWORD=your-app-password\n');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    return transporter;
}

export async function sendVerificationEmail(
    email: string,
    code: string
): Promise<{ success: boolean; previewUrl?: string }> {
    const transport = getTransporter();

    // Demo mode
    if (!transport) {
        console.log(`📧 Demo verification email to ${email}:`);
        console.log(`   ✉️  Subject: İkinci Ses - E-posta Doğrulama Kodu`);
        console.log(`   🔑 Code: ${code}`);
        console.log(`   ✅ Email sent (demo mode)\n`);
        return { success: true };
    }

    try {
        await transport.sendMail({
            from: {
                name: process.env.EMAIL_FROM_NAME || 'İkinci Ses',
                address: process.env.GMAIL_USER!,
            },
            to: email,
            subject: 'İkinci Ses - E-posta Doğrulama Kodu',
            html: getVerificationEmailTemplate(code),
            text: `İkinci Ses platformuna kayıt olmanız için doğrulama kodunuz: ${code}\n\nBu kod 15 dakika içinde geçerliliğini yitirecektir.\n\nBu kodu kimseyle paylaşmayınız!`,
        });

        console.log(`✅ Verification email sent to ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Email send error:', error.message);
        return { success: false };
    }
}

export async function sendWelcomeEmail(
    email: string,
    name: string
): Promise<{ success: boolean }> {
    const transport = getTransporter();

    if (!transport) {
        console.log(`📧 Demo welcome email to ${email} (${name})\n`);
        return { success: true };
    }

    try {
        await transport.sendMail({
            from: {
                name: process.env.EMAIL_FROM_NAME || 'İkinci Ses',
                address: process.env.GMAIL_USER!,
            },
            to: email,
            subject: 'Hoş Geldiniz - İkinci Ses',
            html: getWelcomeEmailTemplate(name),
            text: `Merhaba ${name},\n\nİkinci Ses ailesine katıldığınız için teşekkür ederiz!\n\nPlatformumuzda müzik ekipmanlarınızı alıp satabilir, sorularınızı sorabilir ve müzisyenlerle buluşabilirsiniz.`,
        });

        console.log(`✅ Welcome email sent to ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Welcome email error:', error.message);
        return { success: false };
    }
}

export async function sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    link?: string
): Promise<{ success: boolean }> {
    const transport = getTransporter();

    if (!transport) {
        console.log(`📧 Demo notification email to ${email}: ${title}\n`);
        return { success: true };
    }

    try {
        await transport.sendMail({
            from: {
                name: process.env.EMAIL_FROM_NAME || 'İkinci Ses',
                address: process.env.GMAIL_USER!,
            },
            to: email,
            subject: title,
            html: getNotificationEmailTemplate(title, message, link),
            text: `${title}\n\n${message}${link ? `\n\nLink: ${link}` : ''}`,
        });

        console.log(`✅ Notification email sent to ${email}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Notification email error:', error.message);
        return { success: false };
    }
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

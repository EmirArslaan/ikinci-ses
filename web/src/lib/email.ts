import nodemailer from "nodemailer";

// Email transporter - using Ethereal for demo/testing
// In production, replace with your SMTP settings
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Check if production SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Demo mode: Create test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("📧 Demo email mode - using Ethereal");
    }

    return transporter;
}

export async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; previewUrl?: string }> {
    try {
        const transport = await getTransporter();

        const info = await transport.sendMail({
            from: process.env.SMTP_FROM || '"İkinci Ses" <noreply@ikincises.com>',
            to: email,
            subject: "İkinci Ses - E-posta Doğrulama Kodu",
            text: `İkinci Ses platformuna kayıt olmanız için ${code} numaralı kodu giriş yapmanız gerekmektedir. Bu Kodu Kimseyle paylaşmayınız!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B4513; margin: 0;">İkinci Ses</h1>
                        <p style="color: #666; margin-top: 5px;">Müziğe Yeniden Hayat Ver</p>
                    </div>
                    
                    <div style="background: #f5f5f5; border-radius: 10px; padding: 30px; text-align: center;">
                        <h2 style="color: #333; margin-top: 0;">E-posta Doğrulama Kodu</h2>
                        <p style="color: #666; font-size: 16px;">
                            İkinci Ses platformuna kayıt olmanız için aşağıdaki kodu giriş yapmanız gerekmektedir.
                        </p>
                        <div style="background: #8B4513; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 8px; display: inline-block; margin: 20px 0;">
                            ${code}
                        </div>
                        <p style="color: #999; font-size: 14px;">
                            Bu kod <strong>1 dakika</strong> içinde geçerliliğini yitirecektir.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;">
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            ⚠️ <strong>Bu Kodu Kimseyle Paylaşmayınız!</strong>
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
                    </p>
                </div>
            `,
        });

        // Get preview URL for Ethereal (demo mode)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("📧 Preview URL:", previewUrl);
        }

        return { success: true, previewUrl: previewUrl || undefined };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false };
    }
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

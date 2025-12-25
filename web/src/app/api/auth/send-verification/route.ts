import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, generateVerificationCode } from "@/lib/email";

// POST: Send verification code to email
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "E-posta adresi gerekli" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Geçersiz e-posta formatı" },
                { status: 400 }
            );
        }

        // Check if email is already registered
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Bu e-posta adresi zaten kayıtlı" },
                { status: 400 }
            );
        }

        // Generate 6-digit code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log('🔑 === VERIFICATION CODE DEBUG ===');
        console.log('   Email:', email);
        console.log('   Generated code:', code);
        console.log('   Code type:', typeof code);
        console.log('   Code length:', code.length);
        console.log('   Expires at:', expiresAt);

        // Upsert verification record
        const dbResult = await prisma.emailVerification.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt }
        });

        console.log('   Stored in DB:', dbResult.code);
        console.log('   DB code type:', typeof dbResult.code);
        console.log('   DB code length:', dbResult.code.length);
        console.log('   Codes match:', code === dbResult.code);
        console.log('=================================\n');

        // Send email
        const result = await sendVerificationEmail(email, code);

        if (!result.success) {
            // In production without email configured, provide helpful message
            const isProduction = process.env.NODE_ENV === 'production';
            if (isProduction) {
                return NextResponse.json(
                    {
                        error: "E-posta servisi yapılandırılmamış",
                        message: "E-posta doğrulama şu anda kullanılamıyor. Kayıt olmaya devam edebilirsiniz.",
                        skipVerification: true
                    },
                    { status: 503 } // Service Unavailable
                );
            }

            return NextResponse.json(
                { error: "E-posta gönderilemedi" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Doğrulama kodu gönderildi"
        });
    } catch (error) {
        console.error("Send verification error:", error);
        return NextResponse.json(
            { error: "Doğrulama kodu gönderilemedi" },
            { status: 500 }
        );
    }
}

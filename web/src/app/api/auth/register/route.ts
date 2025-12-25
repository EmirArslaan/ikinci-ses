import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth.validation";
import { validateBody, createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.json();
        const { verificationCode } = rawBody;

        // Validate with Zod
        const validation = registerSchema.safeParse(rawBody);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const { email, password, name, phone } = validation.data;

        // Email verification is optional - allows registration even if email service is unavailable
        let emailVerified = false;

        if (verificationCode) {
            // Verify email code if provided
            const verification = await prisma.emailVerification.findUnique({
                where: { email }
            });

            if (!verification) {
                return NextResponse.json(
                    { error: "Geçersiz doğrulama kodu" },
                    { status: 400 }
                );
            }

            if (new Date() > verification.expiresAt) {
                await prisma.emailVerification.delete({
                    where: { email }
                });
                return NextResponse.json(
                    { error: "Doğrulama kodunun süresi doldu" },
                    { status: 400 }
                );
            }

            // Normalize codes for comparison (trim whitespace, convert to string)
            const normalizedDbCode = String(verification.code).trim();
            const normalizedInputCode = String(verificationCode).trim();

            console.log('🔍 === VERIFICATION CODE VALIDATION ===');
            console.log('   Email:', email);
            console.log('   Raw DB record:', {
                id: verification.id,
                email: verification.email,
                code: verification.code,
                expiresAt: verification.expiresAt
            });
            console.log('   DB Code (raw):', verification.code);
            console.log('   DB Code type:', typeof verification.code);
            console.log('   DB Code (trimmed):', normalizedDbCode);
            console.log('   DB Code length:', normalizedDbCode.length);
            console.log('   DB Code char codes:', normalizedDbCode.split('').map(c => c.charCodeAt(0)));
            console.log('');
            console.log('   Input Code (raw):', verificationCode);
            console.log('   Input Code type:', typeof verificationCode);
            console.log('   Input Code (trimmed):', normalizedInputCode);
            console.log('   Input Code length:', normalizedInputCode.length);
            console.log('   Input Code char codes:', normalizedInputCode.split('').map(c => c.charCodeAt(0)));
            console.log('');
            console.log('   Match result:', normalizedDbCode === normalizedInputCode);
            console.log('   Strict equal:', verification.code === verificationCode);
            console.log('======================================\n');

            if (normalizedDbCode !== normalizedInputCode) {
                return NextResponse.json(
                    { error: "Geçersiz doğrulama kodu" },
                    { status: 400 }
                );
            }

            // Email verified successfully
            emailVerified = true;

            // Delete verification record
            await prisma.emailVerification.delete({
                where: { email }
            });
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: "Bu e-posta adresi zaten kullanılıyor" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user with email verification status
        const user = await prisma.user.create({
            data: {
                email,
                emailVerified,
                password: hashedPassword,
                name,
                phone: phone || null,
            },
        });

        // Send welcome email (non-blocking)
        const { sendWelcomeEmail } = await import('@/lib/email');
        sendWelcomeEmail(user.email, user.name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        // Generate token with role and name
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });

        return NextResponse.json({
            message: "Kayıt başarılı",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Register error:", error);

        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        return NextResponse.json(
            { error: "Kayıt sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}

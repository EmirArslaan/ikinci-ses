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

        if (!verificationCode) {
            return NextResponse.json(
                { error: "E-posta doğrulama kodu zorunludur" },
                { status: 400 }
            );
        }

        // Verify email code
        const verification = await prisma.emailVerification.findUnique({
            where: { email }
        });

        if (!verification) {
            return NextResponse.json(
                { error: "Önce e-posta adresinizi doğrulamalısınız" },
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

        if (verification.code !== verificationCode) {
            return NextResponse.json(
                { error: "Geçersiz doğrulama kodu" },
                { status: 400 }
            );
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

        // Create user with verified email
        const user = await prisma.user.create({
            data: {
                email,
                emailVerified: true,
                password: hashedPassword,
                name,
                phone: phone || null,
            },
        });

        // Delete verification record
        await prisma.emailVerification.delete({
            where: { email }
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

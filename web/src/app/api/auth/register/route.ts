import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, phone, verificationCode } = body;

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "E-posta, şifre ve isim zorunludur" },
                { status: 400 }
            );
        }

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

        // Generate token with role
        const token = generateToken({ userId: user.id, email: user.email, role: user.role });

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
        return NextResponse.json(
            { error: "Kayıt sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}

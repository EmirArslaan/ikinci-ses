import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhoneNumber } from "@/lib/sms";

// POST: Verify phone code
export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json(
                { error: "Telefon numarası ve kod gerekli" },
                { status: 400 }
            );
        }

        const formattedPhone = formatPhoneNumber(phone);

        // Find verification record
        const verification = await prisma.phoneVerification.findUnique({
            where: { phone: formattedPhone }
        });

        if (!verification) {
            return NextResponse.json(
                { error: "Doğrulama kaydı bulunamadı" },
                { status: 400 }
            );
        }

        // Check if expired
        if (new Date() > verification.expiresAt) {
            await prisma.phoneVerification.delete({
                where: { phone: formattedPhone }
            });
            return NextResponse.json(
                { error: "Doğrulama kodunun süresi doldu" },
                { status: 400 }
            );
        }

        // Check code
        if (verification.code !== code) {
            return NextResponse.json(
                { error: "Geçersiz doğrulama kodu" },
                { status: 400 }
            );
        }

        // Delete verification record (will be cleaned up after registration)
        // Keep it for now so register can verify

        return NextResponse.json({
            success: true,
            message: "Telefon doğrulandı",
            phone: formattedPhone
        });
    } catch (error) {
        console.error("Verify phone error:", error);
        return NextResponse.json(
            { error: "Doğrulama sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}

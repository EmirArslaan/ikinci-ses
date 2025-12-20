import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email ve şifre zorunludur" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        let userRole = (user as any)?.role;

        // Fallback: Fetch raw document to bypass stale Prisma Client definition if role is missing
        if (!userRole) {
            try {
                const rawResult = await prisma.$runCommandRaw({
                    find: "User",
                    filter: { email: email },
                    limit: 1
                }) as any;

                if (rawResult?.cursor?.firstBatch?.[0]?.role) {
                    userRole = rawResult.cursor.firstBatch[0].role;
                }
            } catch (e) {
                console.error("Raw command failed:", e);
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: "Email veya şifre hatalı" },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Email veya şifre hatalı" },
                { status: 401 }
            );
        }

        // Generate token with role
        const token = generateToken({ userId: user.id, email: user.email, role: userRole });

        return NextResponse.json({
            message: "Giriş başarılı",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                avatar: user.avatar,
                role: userRole,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Giriş sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}

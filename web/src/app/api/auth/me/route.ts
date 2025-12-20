import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: "Yetkisiz erişim" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                createdAt: true,
                role: true,
            },
        });

        // Workaround for stale Prisma Client: Fetch role via raw command if missing
        let userRole = (user as any)?.role;
        if (!userRole && user) {
            try {
                const rawResult = await prisma.$runCommandRaw({
                    find: "User",
                    filter: { email: user.email },
                    limit: 1
                }) as any;
                if (rawResult?.cursor?.firstBatch?.[0]?.role) {
                    userRole = rawResult.cursor.firstBatch[0].role;
                }
            } catch (e) {
                console.error("Raw command failed in me endpoint:", e);
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: "Kullanıcı bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                ...user,
                role: userRole
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Kullanıcı bilgisi alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

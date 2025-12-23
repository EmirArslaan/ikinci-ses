import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET user by ID (public endpoint)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: "Kullanıcı ID'si gerekli" },
                { status: 400 }
            );
        }

        // Fetch user with only public information
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                avatar: true,
                createdAt: true,
                phone: true, // Phone will be shown on profile
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Kullanıcı bulunamadı" },
                { status: 404 }
            );
        }

        // Count active listings for this user
        const listingsCount = await prisma.listing.count({
            where: {
                userId: userId,
                isActive: true,
            },
        });

        return NextResponse.json({
            user: {
                ...user,
                listingsCount,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Kullanıcı bilgileri alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

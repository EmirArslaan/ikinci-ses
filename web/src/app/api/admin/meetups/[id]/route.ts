import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE meetup
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id } = await params;

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkiniz yok" },
                { status: 403 }
            );
        }

        await prisma.meetup.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin delete meetup error:", error);
        return NextResponse.json(
            { error: "Etkinlik silinirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

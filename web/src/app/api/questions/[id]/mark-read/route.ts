import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST mark answers as read
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id: questionId } = await params;

        if (!payload) {
            return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
        }

        // Verify user owns this question
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            select: { userId: true }
        });

        if (!question || question.userId !== payload.userId) {
            return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
        }

        // Mark all answers as read
        await prisma.answer.updateMany({
            where: {
                questionId,
                userId: { not: payload.userId }
            },
            data: { isReadByOwner: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark answers read error:", error);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}

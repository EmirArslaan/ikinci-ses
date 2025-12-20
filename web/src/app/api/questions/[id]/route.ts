import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single question with answers
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const question = await prisma.question.findUnique({
            where: { id },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                answers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: [
                        { isAccepted: "desc" },
                        { createdAt: "asc" }
                    ],
                },
            },
        });

        if (!question) {
            return NextResponse.json(
                { error: "Soru bulunamadı" },
                { status: 404 }
            );
        }

        // Increment view count
        await prisma.question.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Get question error:", error);
        return NextResponse.json(
            { error: "Soru alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// DELETE question (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id } = await params;

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const question = await prisma.question.findUnique({
            where: { id },
        });

        if (!question) {
            return NextResponse.json(
                { error: "Soru bulunamadı" },
                { status: 404 }
            );
        }

        if (question.userId !== payload.userId && payload.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Bu işlem için yetkiniz yok" },
                { status: 403 }
            );
        }

        // Delete answers first
        await prisma.answer.deleteMany({
            where: { questionId: id },
        });

        // Delete question
        await prisma.question.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete question error:", error);
        return NextResponse.json(
            { error: "Soru silinirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

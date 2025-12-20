import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST create answer
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id: questionId } = await params;

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Cevap içeriği zorunludur" },
                { status: 400 }
            );
        }

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return NextResponse.json(
                { error: "Soru bulunamadı" },
                { status: 404 }
            );
        }

        const answer = await prisma.answer.create({
            data: {
                content: content.trim(),
                questionId,
                userId: payload.userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(answer, { status: 201 });
    } catch (error) {
        console.error("Create answer error:", error);
        return NextResponse.json(
            { error: "Cevap oluşturulurken bir hata oluştu" },
            { status: 500 }
        );
    }
}

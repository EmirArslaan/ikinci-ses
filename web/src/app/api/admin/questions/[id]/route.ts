import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT update question status (approve/reject)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id } = await params;

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkiniz yok" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { approvalStatus } = body;

        if (!["APPROVED", "REJECTED"].includes(approvalStatus)) {
            return NextResponse.json(
                { error: "Geçersiz onay durumu" },
                { status: 400 }
            );
        }

        const question = await prisma.question.update({
            where: { id },
            data: { approvalStatus },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Admin update question error:", error);
        return NextResponse.json(
            { error: "Soru güncellenirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// DELETE question
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

        await prisma.question.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin delete question error:", error);
        return NextResponse.json(
            { error: "Soru silinirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

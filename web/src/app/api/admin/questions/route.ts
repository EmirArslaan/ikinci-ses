import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET questions for admin (with status filter)
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Yetkiniz yok" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "PENDING";
        const limit = parseInt(searchParams.get("limit") || "100");

        const questions = await prisma.question.findMany({
            where: {
                approvalStatus: status as any,
            },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: { answers: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        // Get counts
        const [pending, approved, rejected] = await Promise.all([
            prisma.question.count({ where: { approvalStatus: "PENDING" } }),
            prisma.question.count({ where: { approvalStatus: "APPROVED" } }),
            prisma.question.count({ where: { approvalStatus: "REJECTED" } }),
        ]);

        return NextResponse.json({
            questions,
            stats: { pending, approved, rejected, total: pending + approved + rejected },
        });
    } catch (error) {
        console.error("Admin get questions error:", error);
        return NextResponse.json(
            { error: "Sorular alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

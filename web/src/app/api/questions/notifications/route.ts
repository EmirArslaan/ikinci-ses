import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET unread answer count for user's questions
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ count: 0 });
        }

        // Get all questions owned by this user
        const userQuestions = await prisma.question.findMany({
            where: { userId: payload.userId },
            select: { id: true }
        });

        const questionIds = userQuestions.map(q => q.id);

        if (questionIds.length === 0) {
            return NextResponse.json({ count: 0 });
        }

        // Count unread answers (not by owner themselves)
        const count = await prisma.answer.count({
            where: {
                questionId: { in: questionIds },
                isReadByOwner: false,
                userId: { not: payload.userId } // Don't count user's own answers
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Get Q&A notifications error:", error);
        return NextResponse.json({ count: 0 });
    }
}

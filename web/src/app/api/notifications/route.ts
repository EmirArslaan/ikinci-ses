
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            // Return 0 silently if not auth, or 401. Badge usually just handles 0.
            return NextResponse.json({ count: 0 });
        }

        // Logic: Count messages where (conversation has user) AND (sender != user) AND (isRead == false)
        // Getting conversations first
        const userConversations = await prisma.conversation.findMany({
            where: { participants: { has: payload.userId } },
            select: { id: true }
        });

        const conversationIds = userConversations.map(c => c.id);

        const count = await prisma.message.count({
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: payload.userId },
                isRead: false
            }
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error("Notification count error:", error);
        return NextResponse.json({ count: 0 });
    }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = getUserFromRequest(request);
        const { id } = await params;

        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Functionality: Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            select: { participants: true }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        if (!conversation.participants.includes(payload.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Mark all unread messages from other users as read
        await prisma.message.updateMany({
            where: {
                conversationId: id,
                senderId: { not: payload.userId },
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(messages);

    } catch (error) {
        console.error("Get messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

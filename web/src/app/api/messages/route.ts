
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, content, imageUrl } = await request.json();

        if (!conversationId || (!content && !imageUrl)) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        if (!conversation.participants.includes(payload.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Initialize transaction: Create message + Update conversation
        const message = await prisma.$transaction(async (tx) => {
            const msg = await tx.message.create({
                data: {
                    content: content || "",
                    imageUrl: imageUrl || null,
                    conversationId,
                    senderId: payload.userId,
                    isRead: false
                },
                include: {
                    sender: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            });

            // Update lastMessage text based on message type
            const lastMessageText = imageUrl ? "📷 Görsel" : content;

            await tx.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: lastMessageText,
                    lastMessageAt: new Date()
                }
            });

            return msg;
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

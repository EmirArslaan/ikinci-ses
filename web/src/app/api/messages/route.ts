
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validations/message.validation";
import { createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate with Zod
        const validation = sendMessageSchema.safeParse(body);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const { conversationId, content, imageUrl } = validation.data;

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

        // Create notification for recipient (the other participant)
        const recipientId = conversation.participants.find(p => p !== payload.userId);
        if (recipientId) {
            const { createNotification } = await import("@/lib/notifications");
            const sender = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: { name: true }
            });

            await createNotification({
                userId: recipientId,
                type: "MESSAGE",
                title: "Yeni Mesaj",
                message: `${sender?.name || 'Bir kullanıcı'} size mesaj gönderdi`,
                link: `/messages`
            });
        }

        return NextResponse.json(message);

    } catch (error) {
        console.error("Send message error:", error);

        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

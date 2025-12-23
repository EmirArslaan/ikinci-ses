
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createConversationSchema } from "@/lib/validations/message.validation";
import { createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

// GET: List all conversations for the current user
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    has: payload.userId
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                lastMessageAt: "desc"
            }
        });

        // Format for frontend (identify "other user")
        const formatted = conversations.map(c => {
            const otherUser = c.users.find(u => u.id !== payload.userId) || c.users[0];
            return {
                id: c.id,
                otherUser,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                isRead: true // We'll implement read status logic later or separate count
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Get conversations error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Start or get existing conversation
export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Map receiverId to participantId for validation
        const validationBody = { participantId: body.receiverId };
        const validation = createConversationSchema.safeParse(validationBody);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const { participantId: receiverId } = validation.data;

        if (receiverId === payload.userId) {
            return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
        }

        // Check if conversation exists (Raw query needed for array exact match sometimes, but 'hasEvery' works well in Prisma)
        // Note: MongoDB many-to-many with scalar lists is tricky.
        // We look for any conversation where participants has both IDs.

        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { has: payload.userId } },
                    { participants: { has: receiverId } }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ id: existing.id });
        }

        // Create new
        const newConv = await prisma.conversation.create({
            data: {
                participants: [payload.userId, receiverId],
                users: {
                    connect: [
                        { id: payload.userId },
                        { id: receiverId }
                    ]
                }
            }
        });

        return NextResponse.json({ id: newConv.id });

    } catch (error) {
        console.error("Create conversation error:", error);

        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

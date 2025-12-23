import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        if (notification.userId !== payload.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Mark as read
        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Mark notification as read error:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}

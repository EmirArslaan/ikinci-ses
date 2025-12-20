
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST approve/reject meetup
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body; // APPROVED or REJECTED

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedMeetup = await prisma.meetup.update({
            where: { id },
            data: { approvalStatus: status },
        });

        return NextResponse.json(updatedMeetup);
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating meetup status" },
            { status: 500 }
        );
    }
}

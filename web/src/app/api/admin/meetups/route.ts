
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET pending meetups for admin
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = searchParams.get("limit");

        const where: any = {};
        if (status && status !== "ALL") {
            where.approvalStatus = status;
        }

        const meetups = await prisma.meetup.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json(meetups);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching meetups" },
            { status: 500 }
        );
    }
}

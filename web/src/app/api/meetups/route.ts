
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET all meetups with filters
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");

    try {
        const where: any = { isActive: true, approvalStatus: 'APPROVED' };
        if (type) where.type = type;

        const meetups = await prisma.meetup.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
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

// POST create new meetup
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const { title, description, date, location, type, images, videoUrl, price } = body;

        const meetup = await prisma.meetup.create({
            data: {
                title,
                description,
                date: new Date(date),
                location,
                type,
                images: images || [],
                videoUrl,
                price: price ? parseFloat(price) : null,
                userId: decoded.userId,
            },
        });

        return NextResponse.json(meetup);
    } catch (error) {
        console.error("Create meetup error:", error);
        return NextResponse.json(
            { error: "Error creating meetup" },
            { status: 500 }
        );
    }
}

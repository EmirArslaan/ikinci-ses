
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET single meetup
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const meetup = await prisma.meetup.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        phone: true,
                        email: true, // Only if needed for contact
                    },
                },
            },
        });

        if (!meetup) {
            return NextResponse.json(
                { error: "Meetup not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(meetup);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching meetup" },
            { status: 500 }
        );
    }
}

// PUT update meetup
export async function PUT(
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

        const meetup = await prisma.meetup.findUnique({ where: { id } });
        if (!meetup) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (meetup.userId !== decoded.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const updated = await prisma.meetup.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                date: body.date ? new Date(body.date) : undefined,
                location: body.location,
                type: body.type,
                images: body.images,
                price: body.price ? parseFloat(body.price) : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating meetup" },
            { status: 500 }
        );
    }
}

// DELETE meetup
export async function DELETE(
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

        const meetup = await prisma.meetup.findUnique({ where: { id } });
        if (!meetup) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (meetup.userId !== decoded.userId) {
            // Check if admin (optional, for now strictly owner)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.meetup.delete({ where: { id } });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting meetup" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET: Get current user's favorites (returns listing IDs)
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.userId },
            select: { listingId: true }
        });

        return NextResponse.json({
            favorites: favorites.map(f => f.listingId)
        });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Toggle favorite (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { listingId } = await request.json();
        if (!listingId) {
            return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
        }

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId: user.userId,
                    listingId: listingId
                }
            }
        });

        if (existing) {
            // Remove
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Add
            await prisma.favorite.create({
                data: {
                    userId: user.userId,
                    listingId: listingId
                }
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        let userRole = (user as any)?.role;
        // Workaround for stale client
        if (!userRole && user) {
            try {
                const rawResult = await prisma.$runCommandRaw({
                    find: "User",
                    filter: { email: user.email },
                    limit: 1
                }) as any;
                if (rawResult?.cursor?.firstBatch?.[0]?.role) {
                    userRole = rawResult.cursor.firstBatch[0].role;
                }
            } catch (e) {
                console.error("Raw role check failed:", e);
            }
        }

        if (userRole !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        const where: any = {};
        if (status) {
            where.approvalStatus = status;
        }

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    category: true,
                    brand: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.listing.count({ where }),
        ]);

        // Workaround: Fetch approvalStatus via raw command and merge
        if (listings.length > 0) {
            try {
                const ids = listings.map(l => ({ $oid: l.id }));
                const rawListings = await prisma.$runCommandRaw({
                    find: "Listing",
                    filter: { _id: { $in: ids } },
                }) as any;

                const statusMap = new Map();
                if (rawListings?.cursor?.firstBatch) {
                    rawListings.cursor.firstBatch.forEach((raw: any) => {
                        statusMap.set(raw._id.$oid, raw.approvalStatus || "PENDING");
                    });
                }

                (listings as any[]).forEach(l => {
                    l.approvalStatus = statusMap.get(l.id) || "PENDING";
                });
            } catch (e) {
                console.error("Raw fetch failed:", e);
                // Fallback defaults
                (listings as any[]).forEach(l => {
                    if (!l.approvalStatus) l.approvalStatus = "PENDING";
                });
            }
        }

        return NextResponse.json({
            listings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Admin listings error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

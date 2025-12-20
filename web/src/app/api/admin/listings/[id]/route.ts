
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
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

        const body = await request.json();
        const { action } = body; // 'approve' | 'reject'

        let status: string;
        if (action === "approve") status = "APPROVED";
        else if (action === "reject") status = "REJECTED";
        else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Try standard update, if it fails (due to stale client), use raw update
        let updatedListing;
        try {
            updatedListing = await prisma.listing.update({
                where: { id },
                data: { approvalStatus: status as any }, // cast to any to bypass TS check if type missing
            });
        } catch (e) {
            // Fallback to raw update
            await prisma.$runCommandRaw({
                update: "Listing",
                updates: [
                    {
                        q: { _id: { $oid: id } },
                        u: { $set: { approvalStatus: status } }
                    }
                ]
            });
            // Fetch updated doc to return
            updatedListing = await prisma.listing.findUnique({ where: { id } });
        }

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Admin listing update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
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

        await prisma.listing.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin listing delete error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

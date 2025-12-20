import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single listing
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                        createdAt: true,
                        email: true, // Needed for admin check sometimes or valid user check
                        // role: true, // Removed to prevent crash with stale client
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "İlan bulunamadı" },
                { status: 404 }
            );
        }

        // Workaround: Fetch approvalStatus and user role via raw command if missing
        let approvalStatus = (listing as any).approvalStatus;
        if (!approvalStatus) {
            const rawListing = await prisma.$runCommandRaw({
                find: "Listing",
                filter: { _id: { $oid: id } },
                limit: 1
            }) as any;
            if (rawListing?.cursor?.firstBatch?.[0]) {
                approvalStatus = rawListing.cursor.firstBatch[0].approvalStatus || "PENDING";
            }
        }
        (listing as any).approvalStatus = approvalStatus;

        // Check visibility
        if (approvalStatus !== "APPROVED" || !listing.isActive) {
            const payload = getUserFromRequest(request);

            let isAuthorized = false;

            if (payload) {
                // Check if owner
                if (payload.userId === listing.userId) {
                    isAuthorized = true;
                } else {
                    // Check if admin
                    const user = await prisma.user.findUnique({
                        where: { id: payload.userId },
                    });

                    let userRole = (user as any)?.role;
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

                    if (userRole === "ADMIN") {
                        isAuthorized = true;
                    }
                }
            }

            if (!isAuthorized) {
                return NextResponse.json(
                    { error: "İlan bulunamadı veya onay sürecinde" },
                    { status: 404 }
                );
            }
        }

        // Increment view count
        await prisma.listing.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Get listing error:", error);
        return NextResponse.json(
            { error: "İlan alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// PUT update listing
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const listing = await prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "İlan bulunamadı" },
                { status: 404 }
            );
        }

        if (listing.userId !== payload.userId) {
            return NextResponse.json(
                { error: "Bu ilanı düzenleme yetkiniz yok" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            price,
            condition,
            images,
            phone,
            location,
            categoryId,
            brandId,
            isActive,
        } = body;

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(condition && { condition }),
                ...(images && { images }),
                ...(phone && { phone }),
                ...(location && { location }),
                ...(categoryId && { categoryId }),
                ...(brandId && { brandId }),
                ...(typeof isActive === "boolean" && { isActive }),
            },
            include: {
                category: true,
                brand: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        // Workaround: Reset approvalStatus to PENDING via raw command
        try {
            await prisma.$runCommandRaw({
                update: "Listing",
                updates: [
                    {
                        q: { _id: { $oid: id } },
                        u: { $set: { approvalStatus: "PENDING" } }
                    }
                ]
            });
            // Update the response object to reflect the change
            (updatedListing as any).approvalStatus = "PENDING";
        } catch (e) {
            console.error("Failed to reset approval status:", e);
        }

        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Update listing error:", error);
        return NextResponse.json(
            { error: "İlan güncellenirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// DELETE listing
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const listing = await prisma.listing.findUnique({
            where: { id },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "İlan bulunamadı" },
                { status: 404 }
            );
        }

        if (listing.userId !== payload.userId) {
            return NextResponse.json(
                { error: "Bu ilanı silme yetkiniz yok" },
                { status: 403 }
            );
        }

        await prisma.listing.delete({
            where: { id },
        });

        return NextResponse.json({ message: "İlan başarıyla silindi" });
    } catch (error) {
        console.error("Delete listing error:", error);
        return NextResponse.json(
            { error: "İlan silinirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

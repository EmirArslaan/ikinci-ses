import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");

        // Get user with rating stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                averageRating: true,
                totalReviews: true,
                isVerified: true,
                isTrustedSeller: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get reviews
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { reviewedId: userId },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.review.count({ where: { reviewedId: userId } })
        ]);

        return NextResponse.json({
            user: {
                averageRating: user.averageRating,
                totalReviews: user.totalReviews,
                isVerified: user.isVerified,
                isTrustedSeller: user.isTrustedSeller
            },
            reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get user reviews error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

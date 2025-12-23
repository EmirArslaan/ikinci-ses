import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateUserRating } from "@/lib/badges";
import { createReviewSchema } from "@/lib/validations/review.validation";
import { createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

// POST - Create a review
export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate with Zod
        const validation = createReviewSchema.safeParse(body);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const { reviewedId, rating, comment, listingId } = validation.data;

        // Cannot review yourself
        if (payload.userId === reviewedId) {
            return NextResponse.json(
                { error: "Cannot review yourself" },
                { status: 400 }
            );
        }

        // Check if user being reviewed exists
        const reviewedUser = await prisma.user.findUnique({
            where: { id: reviewedId }
        });

        if (!reviewedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Create review (unique constraint prevents duplicates)
        const review = await prisma.review.create({
            data: {
                reviewerId: payload.userId,
                reviewedId,
                rating,
                comment: comment || null,
                listingId: listingId || null
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        // Update reviewed user's rating statistics and badges
        await updateUserRating(reviewedId);

        return NextResponse.json(review, { status: 201 });

    } catch (error: any) {
        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        // Handle duplicate review error
        if (error?.code === 11000 || error?.message?.includes('unique constraint')) {
            return NextResponse.json(
                { error: "You have already reviewed this user for this listing" },
                { status: 409 }
            );
        }

        console.error("Create review error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}

// GET - List reviews
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reviewedId = searchParams.get("reviewedId");
        const reviewerId = searchParams.get("reviewerId");
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");

        const where: any = {};
        if (reviewedId) where.reviewedId = reviewedId;
        if (reviewerId) where.reviewerId = reviewerId;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    },
                    reviewed: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.review.count({ where })
        ]);

        return NextResponse.json({
            reviews,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get reviews error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

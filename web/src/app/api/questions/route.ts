import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createQuestionSchema } from "@/lib/validations/question.validation";
import { createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

// GET all questions with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");
        const userId = searchParams.get("userId");
        const sort = searchParams.get("sort") || "newest";
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");

        const where: any = {};

        // Filter by category
        if (categoryId) where.categoryId = categoryId;

        // Filter by user
        if (userId) where.userId = userId;

        // Filter featured
        if (featured === "true") {
            where.isFeatured = true;
            where.featuredUntil = { gte: new Date() };
        }

        // Search
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Only show approved questions (unless filtering by userId for profile)
        if (!userId) {
            where.approvalStatus = "APPROVED";
        }

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                include: {
                    category: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    _count: {
                        select: { answers: true }
                    }
                },
                orderBy: (() => {
                    switch (sort) {
                        case "oldest":
                            return [{ isPriority: "desc" }, { createdAt: "asc" }];
                        case "popular":
                            return [{ isPriority: "desc" }, { viewCount: "desc" }];
                        case "priority":
                            return [{ isPriority: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }];
                        case "newest":
                        default:
                            return [{ isPriority: "desc" }, { createdAt: "desc" }];
                    }
                })() as any,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.question.count({ where }),
        ]);

        return NextResponse.json({
            questions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get questions error:", error);
        return NextResponse.json(
            { error: "Sorular alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// POST create question
export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate with Zod
        const validation = createQuestionSchema.safeParse(body);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const {
            title,
            description,
            images,
            categoryId,
        } = validation.data;

        // Handle promotion fields separately
        const {
            isFeatured,
            featuredUntil,
            isPriority,
            priorityUntil,
        } = body;

        const question = await prisma.question.create({
            data: {
                title,
                description,
                images: images || [],
                categoryId,
                userId: payload.userId,
                // Promotion fields
                isFeatured: isFeatured || false,
                featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
                isPriority: isPriority || false,
                priorityUntil: priorityUntil ? new Date(priorityUntil) : null,
            },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        console.error("Create question error:", error);

        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        return NextResponse.json(
            { error: "Soru oluşturulurken bir hata oluştu" },
            { status: 500 }
        );
    }
}

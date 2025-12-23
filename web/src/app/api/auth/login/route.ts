import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth.validation";
import { createValidationErrorResponse, ValidationError } from "@/lib/validations/validation-helpers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return createValidationErrorResponse(new ValidationError(validation.error.issues));
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        let userRole = (user as any)?.role;

        // Fallback: Fetch raw document to bypass stale Prisma Client definition if role is missing
        if (!userRole) {
            try {
                const rawResult = await prisma.$runCommandRaw({
                    find: "User",
                    filter: { email: email },
                    limit: 1
                }) as any;

                if (rawResult?.cursor?.firstBatch?.[0]?.role) {
                    userRole = rawResult.cursor.firstBatch[0].role;
                }
            } catch (e) {
                console.error("Raw command failed:", e);
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: "Email veya şifre hatalı" },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Email veya şifre hatalı" },
                { status: 401 }
            );
        }

        // Generate token with role and name
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: userRole
        });

        return NextResponse.json({
            message: "Giriş başarılı",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                avatar: user.avatar,
                role: userRole,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);

        // Handle validation errors
        if (error instanceof ValidationError) {
            return createValidationErrorResponse(error);
        }

        return NextResponse.json(
            { error: "Giriş sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}

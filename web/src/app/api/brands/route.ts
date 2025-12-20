import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all brands
export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(brands);
    } catch (error) {
        console.error("Get brands error:", error);
        return NextResponse.json(
            { error: "Markalar alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// POST create brand (for admin/seeding)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, logo } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Marka adı zorunludur" },
                { status: 400 }
            );
        }

        const slug = name
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const brand = await prisma.brand.create({
            data: { name, slug, logo },
        });

        return NextResponse.json(brand, { status: 201 });
    } catch (error) {
        console.error("Create brand error:", error);
        return NextResponse.json(
            { error: "Marka oluşturulurken bir hata oluştu" },
            { status: 500 }
        );
    }
}

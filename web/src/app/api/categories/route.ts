import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        return NextResponse.json(
            { error: "Kategoriler alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// POST create category (for admin/seeding)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, icon } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Kategori adı zorunludur" },
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

        const category = await prisma.category.create({
            data: { name, slug, icon },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Create category error:", error);
        return NextResponse.json(
            { error: "Kategori oluşturulurken bir hata oluştu" },
            { status: 500 }
        );
    }
}

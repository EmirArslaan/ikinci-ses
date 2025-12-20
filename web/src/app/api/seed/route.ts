import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const categories = [
    { name: "Aksesuar", slug: "aksesuar", icon: "🎼" },
    { name: "Amfi & Efekt", slug: "amfi-efekt", icon: "🔊" },
    { name: "DJ Ekipmanları", slug: "dj-ekipmanlari", icon: "🎧" },
    { name: "Davul & Perkisyon", slug: "davul-perkisyon", icon: "🥁" },
    { name: "Klasik Gitar", slug: "klasik-gitar", icon: "🎸" },
    { name: "Akustik Gitar", slug: "akustik-gitar", icon: "🎸" },
    { name: "Elektro Gitar", slug: "elektro-gitar", icon: "🎸" },
    { name: "Bas Gitar", slug: "bas-gitar", icon: "🎸" },
    { name: "Nefesli Çalgılar", slug: "nefesli-calgilar", icon: "🎷" },
    { name: "Piyano & Klavye", slug: "piyano-klavye", icon: "🎹" },
    { name: "Stüdyo Ekipmanları", slug: "studyo-ekipmanlari", icon: "🎙️" },
    { name: "Yaylı Çalgılar", slug: "yayli-calgilar", icon: "🎻" },
];

const brands = [
    { name: "Fender", slug: "fender" },
    { name: "Gibson", slug: "gibson" },
    { name: "Ibanez", slug: "ibanez" },
    { name: "Yamaha", slug: "yamaha" },
    { name: "Roland", slug: "roland" },
    { name: "Marshall", slug: "marshall" },
    { name: "Boss", slug: "boss" },
    { name: "Korg", slug: "korg" },
    { name: "Shure", slug: "shure" },
    { name: "Audio-Technica", slug: "audio-technica" },
    { name: "Sennheiser", slug: "sennheiser" },
    { name: "Pearl", slug: "pearl" },
    { name: "DW", slug: "dw" },
    { name: "Taylor", slug: "taylor" },
    { name: "Martin", slug: "martin" },
    { name: "PRS", slug: "prs" },
    { name: "ESP", slug: "esp" },
    { name: "Schecter", slug: "schecter" },
    { name: "Nord", slug: "nord" },
    { name: "Moog", slug: "moog" },
    { name: "Diğer", slug: "diger" },
];

export async function GET() {
    try {
        // Seed categories
        for (const category of categories) {
            await prisma.category.upsert({
                where: { slug: category.slug },
                update: {},
                create: category,
            });
        }

        // Seed brands
        for (const brand of brands) {
            await prisma.brand.upsert({
                where: { slug: brand.slug },
                update: {},
                create: brand,
            });
        }

        return NextResponse.json({
            message: "Database seeded successfully!",
            categories: categories.length,
            brands: brands.length,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Seeding failed" },
            { status: 500 }
        );
    }
}

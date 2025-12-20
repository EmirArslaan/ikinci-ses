import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";

// GET: Get user settings
export async function GET(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                phoneVerified: true,
                avatar: true,
                createdAt: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Get settings error:", error);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}

// PUT: Update user settings
export async function PUT(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, currentPassword, newPassword, avatar } = body;

        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {};

        // Update name
        if (name && name !== user.name) {
            updateData.name = name;
        }

        // Update email
        if (email && email !== user.email) {
            // Check if new email is already taken
            const existingEmail = await prisma.user.findUnique({
                where: { email }
            });
            if (existingEmail) {
                return NextResponse.json({ error: "Bu email adresi zaten kullanılıyor" }, { status: 400 });
            }
            updateData.email = email;
        }

        // Update password
        if (currentPassword && newPassword) {
            const isValidPassword = await verifyPassword(currentPassword, user.password);
            if (!isValidPassword) {
                return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
            }
            updateData.password = await hashPassword(newPassword);
        }

        // Update avatar
        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        // Apply updates
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "Değişiklik yapılmadı" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                phoneVerified: true,
                avatar: true
            }
        });

        return NextResponse.json({
            message: "Ayarlar güncellendi",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}

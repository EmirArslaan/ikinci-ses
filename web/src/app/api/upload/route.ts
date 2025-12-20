import { NextRequest, NextResponse } from "next/server";
import { uploadImage, uploadVideo } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const payload = getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: "Giriş yapmalısınız" },
                { status: 401 }
            );
        }

        const contentType = request.headers.get("content-type") || "";

        let imageData: string;

        // Handle FormData (file upload from ListingForm)
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: "Dosya zorunludur" },
                    { status: 400 }
                );
            }

            // Convert file to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString("base64");
            const mimeType = file.type || "image/jpeg";
            imageData = `data:${mimeType};base64,${base64}`;
        }
        // Handle JSON (base64 image from message upload)
        else {
            const body = await request.json();
            const { image } = body;

            if (!image) {
                return NextResponse.json(
                    { error: "Görsel verisi zorunludur" },
                    { status: 400 }
                );
            }

            imageData = image;
        }

        let url: string;
        const isVideo = imageData.startsWith("data:video");

        if (isVideo) {
            url = await uploadVideo(imageData);
        } else {
            url = await uploadImage(imageData);
        }

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Görsel yüklenirken bir hata oluştu" },
            { status: 500 }
        );
    }
}

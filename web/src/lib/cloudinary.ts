import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(base64Data: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Data, {
        folder: "ikinci-el-muzik",
    });
    return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

export async function uploadVideo(base64Data: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Data, {
        folder: "ikinci-el-muzik/videos",
        resource_type: "video",
    });
    return result.secure_url;
}

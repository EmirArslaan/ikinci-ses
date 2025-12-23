/**
 * Cloudinary URL Transformation Utilities
 * Client-side utilities for optimizing Cloudinary images
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface ImageTransformOptions {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    gravity?: 'auto' | 'face' | 'center';
    blur?: number;
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
    publicIdOrUrl: string,
    options: ImageTransformOptions = {}
): string {
    if (!publicIdOrUrl) return '';

    // Extract public ID from full URL if needed
    const publicId = extractPublicId(publicIdOrUrl);

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity = 'auto',
        blur,
    } = options;

    // Build transformation string
    const transformations: string[] = [];

    if (width || height) {
        const dims = [
            width ? `w_${width}` : '',
            height ? `h_${height}` : '',
            `c_${crop}`,
        ].filter(Boolean).join(',');
        transformations.push(dims);
    }

    if (gravity && crop !== 'scale') {
        transformations.push(`g_${gravity}`);
    }

    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    if (blur) {
        transformations.push(`e_blur:${blur}`);
    }

    const transformStr = transformations.join(',');
    return `${CLOUDINARY_BASE_URL}/${transformStr}/${publicId}`;
}

/**
 * Generate thumbnail URL (optimized for small images)
 */
export function getThumbnailUrl(publicIdOrUrl: string, size: number = 200): string {
    return getCloudinaryUrl(publicIdOrUrl, {
        width: size,
        height: size,
        crop: 'thumb',
        gravity: 'face',
        quality: 80,
    });
}

/**
 * Generate responsive srcSet for different screen sizes
 */
export function getResponsiveSrcSet(
    publicIdOrUrl: string,
    widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
    return widths
        .map((width) => {
            const url = getCloudinaryUrl(publicIdOrUrl, {
                width,
                quality: 80,
                format: 'auto',
            });
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Generate blur placeholder (tiny, low-quality image for loading)
 */
export function getBlurPlaceholder(publicIdOrUrl: string): string {
    return getCloudinaryUrl(publicIdOrUrl, {
        width: 20,
        quality: 10,
        blur: 1000,
        format: 'jpg',
    });
}

/**
 * Extract Cloudinary public ID from URL
 */
export function extractPublicId(urlOrId: string): string {
    if (!urlOrId) return '';

    // If it's already a public ID (no http), return as is
    if (!urlOrId.startsWith('http')) {
        return urlOrId;
    }

    // Extract from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
    const match = urlOrId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return match ? match[1] : urlOrId;
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
    return url?.includes('cloudinary.com') || url?.includes('res.cloudinary');
}

/**
 * Cloudinary loader for Next.js Image component
 */
export function cloudinaryLoader({
    src,
    width,
    quality
}: {
    src: string;
    width: number;
    quality?: number
}): string {
    return getCloudinaryUrl(src, {
        width,
        quality: quality || 80,
        format: 'auto',
    });
}

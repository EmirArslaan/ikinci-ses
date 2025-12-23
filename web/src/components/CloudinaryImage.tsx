import Image from 'next/image';
import { useState } from 'react';
import { cloudinaryLoader, getBlurPlaceholder, isCloudinaryUrl } from '@/lib/cloudinary-utils';

interface CloudinaryImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    quality?: number;
}

/**
 * Enhanced Cloudinary Image Component
 * 
 * Features:
 * - Automatic Cloudinary transformations
 * - WebP/AVIF format conversion
 * - Lazy loading with blur placeholder
 * - Error handling with fallback
 * - Responsive images with srcSet
 * - Optimized quality settings
 */
export function CloudinaryImage({
    src,
    alt,
    width,
    height,
    className = '',
    fill = false,
    priority = false,
    sizes,
    objectFit = 'cover',
    quality = 80,
}: CloudinaryImageProps) {
    const [error, setError] = useState(false);
    const fallbackSrc = '/images/placeholder.png';

    // Use Cloudinary if it's a Cloudinary URL
    const useCloudinaryLoader = isCloudinaryUrl(src);

    const imageProps: Record<string, unknown> = {
        src: error ? fallbackSrc : src || fallbackSrc,
        alt,
        className,
        quality,
        onError: () => setError(true),
    };

    // Use Cloudinary loader for Cloudinary images
    if (useCloudinaryLoader && !error) {
        imageProps.loader = cloudinaryLoader;
        imageProps.placeholder = 'blur';
        imageProps.blurDataURL = getBlurPlaceholder(src);
    }

    if (fill) {
        imageProps.fill = true;
        imageProps.style = { objectFit };
        if (sizes) imageProps.sizes = sizes;
    } else {
        imageProps.width = width || 400;
        imageProps.height = height || 300;
    }

    if (priority) {
        imageProps.priority = true;
        delete imageProps.placeholder;
        delete imageProps.blurDataURL;
    }

    return <Image {...imageProps} />;
}

/**
 * Simple optimized image for non-Cloudinary sources
 */
export function OptimizedImage(props: CloudinaryImageProps) {
    return <CloudinaryImage {...props} />;
}

export default CloudinaryImage;

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Automatic WebP/AVIF conversion
 * - Lazy loading by default
 * - Blur placeholder
 * - Error handling with fallback
 * - Responsive images
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    fill = false,
    priority = false,
    sizes,
    objectFit = 'cover',
}: OptimizedImageProps) {
    const [error, setError] = useState(false);

    // Fallback image
    const fallbackSrc = '/images/placeholder.png';

    // If external URL and not Cloudinary, return regular img
    if (src && !src.includes('cloudinary') && src.startsWith('http')) {
        return (
            <img
                src={error ? fallbackSrc : src}
                alt={alt}
                className={className}
                onError={() => setError(true)}
                loading={priority ? 'eager' : 'lazy'}
            />
        );
    }

    const imageProps: any = {
        src: error ? fallbackSrc : src || fallbackSrc,
        alt,
        className,
        loading: priority ? undefined : 'lazy',
        placeholder: 'blur' as const,
        blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQ/9k=',
        onError: () => setError(true),
    };

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
    }

    return <Image {...imageProps} />;
}
